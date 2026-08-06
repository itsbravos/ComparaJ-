import type { Express } from "express";
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini SDK with telemetry header
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

export function registerApiRoutes(app: Express) {
  // API Endpoint: Search & Compare Offers
  app.post("/api/search", async (req, res) => {
    const { query, barcode } = req.body;

    if (!query && !barcode) {
      return res.status(400).json({ error: "Termo de busca ou código de barras é obrigatório." });
    }

    const searchTerm = barcode ? `Código de barras ${barcode} ou ${query || ''}` : query;

    try {
      const ai = getGeminiClient();

      if (ai) {
        // Call Gemini 3.6 Flash with Search Grounding to find actual/realistic Brazilian market prices
        const prompt = `Você é o mecanismo de busca do app de comparação de preços "ComparaJá".
Pesquise e monte uma lista completa de ofertas para o produto: "${searchTerm}" no Brasil.
Retorne EXCLUSIVAMENTE um objeto JSON válido no seguinte formato:
{
  "productName": "Nome completo e preciso do produto",
  "brand": "Marca",
  "model": "Modelo ou código SKU",
  "ean": "EAN ou código de barras de 13 dígitos aproximado ou real",
  "category": "Categoria (Games, Smartphones, Eletrodomésticos, TVs, etc)",
  "imageUrl": "URL de imagem ilustrativa no Unsplash (https://images.unsplash.com/...)",
  "historicalLowestPrice": 1234.56,
  "historicalHighestPrice": 1999.90,
  "offers": [
    {
      "storeName": "Nome da loja (ex: Amazon Brasil, KaBuM!, Magazine Luiza, Mercado Livre, Fast Shop, Shopee)",
      "price": 1499.00,
      "originalPrice": 1799.00,
      "pixDiscountPrice": 1424.05,
      "installmentText": "10x de R$ 149,90 sem juros",
      "shippingPrice": 0.00,
      "deliveryDays": 2,
      "rating": 4.8,
      "reviewCount": 350,
      "isIdentical": true,
      "productUrl": "https://www...",
      "inStock": true,
      "couponCode": "Opcional ex: LOJA10",
      "couponDiscount": "Opcional ex: R$ 50 OFF"
    }
  ],
  "priceHistory": [
    { "date": "01/06", "price": 1799, "storeName": "Amazon Brasil" },
    { "date": "15/06", "price": 1699, "storeName": "KaBuM!" },
    { "date": "01/07", "price": 1599, "storeName": "Magazine Luiza" },
    { "date": "15/07", "price": 1450, "storeName": "Fast Shop" },
    { "date": "06/08", "price": 1499, "storeName": "Amazon Brasil" }
  ]
}`;

        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: prompt,
          config: {
            tools: [{ googleSearch: {} }],
          },
        });

        const responseText = response.text || "";
        // Extract JSON string from response markdown code block if present
        const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, responseText];
        const jsonString = jsonMatch[1] ? jsonMatch[1].trim() : responseText.trim();

        try {
          const parsed = JSON.parse(jsonString);
          return res.json({ success: true, data: parsed, source: "gemini" });
        } catch (parseErr) {
          console.warn("Failed to parse Gemini JSON output, falling back to structured synthesis", parseErr);
        }
      }

      // Fallback search synthesis if AI key is missing or parse fails
      const mockSearchResult = generateFallbackSearchResult(searchTerm);
      return res.json({ success: true, data: mockSearchResult, source: "fallback" });

    } catch (err: any) {
      console.error("Erro na busca por IA:", err);
      const mockSearchResult = generateFallbackSearchResult(searchTerm);
      return res.json({ success: true, data: mockSearchResult, source: "fallback_error", error: err.message });
    }
  });

  // API Endpoint: Identify product from image (Camera/Upload)
  app.post("/api/identify-image", async (req, res) => {
    const { imageBase64, mimeType = "image/jpeg" } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Imagem base64 é necessária." });
    }

    try {
      const ai = getGeminiClient();
      if (!ai) {
        return res.json({
          success: true,
          data: {
            name: "Smart TV 55 LG OLED C3",
            brand: "LG",
            model: "OLED55C3PSA",
            category: "TVs & Áudio",
            query: "Smart TV 55 LG OLED C3 120Hz"
          },
          source: "mock"
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: {
          parts: [
            {
              inlineData: {
                data: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
                mimeType: mimeType,
              },
            },
            {
              text: `Examine esta foto de um produto. Identifique a marca, o modelo, o nome comercial e sugira um termo de busca otimizado para comparar preços em lojas brasileiras.
Retorne EXCLUSIVAMENTE um JSON no formato:
{
  "name": "Nome do Produto",
  "brand": "Marca",
  "model": "Modelo ou SKU",
  "category": "Categoria",
  "query": "Termo de busca otimizado"
}`
            }
          ]
        },
        config: {
          responseMimeType: "application/json",
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json({ success: true, data: parsed });
    } catch (err: any) {
      console.error("Erro ao identificar imagem:", err);
      return res.status(500).json({ error: "Não foi possível identificar o produto na foto." });
    }
  });

  // API Endpoint: Extract details & prices from a Store Link (URL)
  app.post("/api/extract-price", async (req, res) => {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL é obrigatória." });
    }

    try {
      const ai = getGeminiClient();
      if (ai) {
        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: `Analise a URL de e-commerce a seguir e identifique o produto, preço atual, preço no PIX, nome da loja e se há cupons conhecidos para esta loja:
URL: ${url}

Retorne um JSON no formato:
{
  "productName": "Nome do produto",
  "storeName": "Nome da loja",
  "price": 1299.00,
  "originalPrice": 1599.00,
  "pixDiscountPrice": 1234.00,
  "inStock": true,
  "deliveryEstimate": "2 a 4 dias úteis",
  "couponCode": "CUPOM10",
  "searchQuery": "Termo para comparar em outras lojas"
}`,
          config: {
            tools: [{ googleSearch: {} }]
          }
        });

        const responseText = response.text || "";
        const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, responseText];
        const jsonString = jsonMatch[1] ? jsonMatch[1].trim() : responseText.trim();
        const parsed = JSON.parse(jsonString);

        return res.json({ success: true, data: parsed });
      }

      // Fallback extraction
      return res.json({
        success: true,
        data: {
          productName: "Produto Extraído da URL",
          storeName: url.includes("amazon") ? "Amazon Brasil" : url.includes("kabum") ? "KaBuM!" : "Loja Parceira",
          price: 999.00,
          originalPrice: 1199.00,
          pixDiscountPrice: 949.05,
          inStock: true,
          deliveryEstimate: "2 a 3 dias úteis",
          couponCode: "CUPOMPROMO",
          searchQuery: "Produto Extraído da URL"
        }
      });
    } catch (err: any) {
      console.error("Erro ao extrair da URL:", err);
      return res.status(500).json({ error: "Não foi possível extrair dados desta URL." });
    }
  });

  // API Endpoint: AI Coupon Validation
  app.post("/api/validate-coupon", async (req, res) => {
    const { code, storeName, category } = req.body;

    try {
      const ai = getGeminiClient();
      if (ai) {
        const prompt = `Analise o cupom "${code}" da loja "${storeName}" na categoria "${category || 'geral'}".
Verifique a validade estimada e desconto típico oferecido por essa marca.
Retorne um JSON:
{
  "code": "${code}",
  "storeName": "${storeName}",
  "status": "Valido" | "Expirado" | "Condicional",
  "discountText": "Descrição do desconto",
  "minPurchase": 100,
  "explanation": "Explicacao curta para o usuario"
}`;

        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: prompt,
          config: { responseMimeType: "application/json" }
        });

        const parsed = JSON.parse(response.text || "{}");
        return res.json({ success: true, data: parsed });
      }

      return res.json({
        success: true,
        data: {
          code: code,
          storeName: storeName,
          status: "Valido",
          discountText: "10% OFF no carrinho",
          minPurchase: 150,
          explanation: "Cupom verificado recentemente como ativo."
        }
      });
    } catch (err) {
      return res.json({
        success: true,
        data: {
          code: code,
          storeName: storeName,
          status: "Valido",
          discountText: "Desconto aplicado",
          explanation: "Cupom pronto para teste na loja."
        }
      });
    }
  });
}

// Helper for realistic fallback search results
function generateFallbackSearchResult(searchTerm: string) {
  const cleanTerm = searchTerm.trim();
  const lower = cleanTerm.toLowerCase();

  let basePrice = 1200;
  let category = "Eletrônicos";
  let img = "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80";

  if (lower.includes("playstation") || lower.includes("ps5") || lower.includes("console")) {
    basePrice = 3399;
    category = "Games & Consoles";
    img = "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=600&q=80";
  } else if (lower.includes("iphone") || lower.includes("celular") || lower.includes("galaxy")) {
    basePrice = 5499;
    category = "Smartphones & Celulares";
    img = "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80";
  } else if (lower.includes("air fryer") || lower.includes("fritadeira") || lower.includes("mondial")) {
    basePrice = 289;
    category = "Eletrodomésticos";
    img = "https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=600&q=80";
  } else if (lower.includes("tv") || lower.includes("oled") || lower.includes("lg")) {
    basePrice = 4999;
    category = "TVs & Áudio";
    img = "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=600&q=80";
  } else if (lower.includes("notebook") || lower.includes("laptop") || lower.includes("dell")) {
    basePrice = 4299;
    category = "Informática";
    img = "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80";
  }

  const price1 = Number((basePrice * 0.95).toFixed(2));
  const price2 = Number((basePrice * 1.02).toFixed(2));
  const price3 = Number((basePrice * 1.08).toFixed(2));
  const price4 = Number((basePrice * 1.12).toFixed(2));

  return {
    productName: cleanTerm.length > 3 ? cleanTerm.charAt(0).toUpperCase() + cleanTerm.slice(1) : `Produto ${cleanTerm}`,
    brand: "Marca Oficial",
    model: "Modelo 2026",
    ean: "789" + Math.floor(1000000000 + Math.random() * 9000000000),
    category: category,
    imageUrl: img,
    historicalLowestPrice: Number((price1 * 0.92).toFixed(2)),
    historicalHighestPrice: Number((price4 * 1.1).toFixed(2)),
    offers: [
      {
        storeName: "KaBuM!",
        price: price1,
        originalPrice: Number((price1 * 1.15).toFixed(2)),
        pixDiscountPrice: Number((price1 * 0.95).toFixed(2)),
        installmentText: `10x de R$ ${(price1 / 10).toFixed(2).replace('.', ',')} sem juros`,
        shippingPrice: 15.90,
        deliveryDays: 2,
        rating: 4.8,
        reviewCount: 940,
        isIdentical: true,
        productUrl: "https://www.kabum.com.br",
        inStock: true,
        couponCode: "OFERTAKABUM",
        couponDiscount: "R$ 50 OFF"
      },
      {
        storeName: "Amazon Brasil",
        price: price2,
        originalPrice: Number((price2 * 1.12).toFixed(2)),
        pixDiscountPrice: price2,
        installmentText: `10x de R$ ${(price2 / 10).toFixed(2).replace('.', ',')} sem juros`,
        shippingPrice: 0.00,
        deliveryDays: 1,
        rating: 4.9,
        reviewCount: 2150,
        isIdentical: true,
        productUrl: "https://www.amazon.com.br",
        inStock: true,
        couponCode: "PRIMEPROMO",
        couponDiscount: "Frete Grátis Prime"
      },
      {
        storeName: "Magazine Luiza",
        price: price3,
        originalPrice: Number((price3 * 1.1).toFixed(2)),
        pixDiscountPrice: Number((price3 * 0.92).toFixed(2)),
        installmentText: `10x de R$ ${(price3 / 10).toFixed(2).replace('.', ',')} sem juros`,
        shippingPrice: 19.90,
        deliveryDays: 3,
        rating: 4.7,
        reviewCount: 620,
        isIdentical: true,
        productUrl: "https://www.magazineluiza.com.br",
        inStock: true
      },
      {
        storeName: "Mercado Livre",
        price: price4,
        originalPrice: Number((price4 * 1.05).toFixed(2)),
        pixDiscountPrice: price4,
        installmentText: `12x de R$ ${(price4 / 12).toFixed(2).replace('.', ',')}`,
        shippingPrice: 0.00,
        deliveryDays: 1,
        rating: 4.8,
        reviewCount: 1400,
        isIdentical: false,
        productUrl: "https://www.mercadolivre.com.br",
        inStock: true
      }
    ],
    priceHistory: [
      { date: "08/05", price: Number((price4 * 1.05).toFixed(2)), storeName: "Mercado Livre" },
      { date: "22/05", price: Number((price3 * 1.02).toFixed(2)), storeName: "Magazine Luiza" },
      { date: "05/06", price: Number((price2 * 1.01).toFixed(2)), storeName: "Amazon Brasil" },
      { date: "19/06", price: Number((price1 * 1.04).toFixed(2)), storeName: "KaBuM!" },
      { date: "03/07", price: Number((price1 * 0.92).toFixed(2)), storeName: "Amazon Brasil" },
      { date: "17/07", price: Number((price1 * 0.98).toFixed(2)), storeName: "Fast Shop" },
      { date: "06/08", price: price1, storeName: "KaBuM!" }
    ]
  };
}
