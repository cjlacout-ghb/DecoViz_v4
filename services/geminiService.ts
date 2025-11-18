import { GoogleGenAI, GenerateContentResponse, Modality, Type } from "@google/genai";
import { DecorStyle, DECOR_STYLES, Proposal } from '../types';

// Helper function to get a new GoogleGenAI instance right before an API call
const getGenAIInstance = () => {
  // The guidelines state process.env.API_KEY is pre-configured and accessible.
  // This approach ensures it's accessed dynamically at the point of use.
  if (typeof process === 'undefined' || !process.env || !process.env.API_KEY) {
    throw new Error('API_KEY not found. Ensure process.env.API_KEY is configured and available.');
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY as string });
};

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const base64ToGenerativePart = (base64: string, mimeType: string = 'image/jpeg') => {
  return {
    inlineData: { data: base64, mimeType },
  };
};

const styleInstructions: Record<DecorStyle, string> = {
  "Moderno": `
    **STYLE GUIDELINES (Moderno):**
    - **Líneas limpias y formas simples:** Enfócate en la pureza de las líneas rectas y las formas geométricas abstractas, evitando decoraciones innecesarias.
    - **Funcionalidad:** Cada elemento debe cumplir un propósito específico.
    - **Nuevos materiales:** Utiliza acero, hormigón y vidrio para crear una estética de grandes ventanales y plantas diáfanas.
    - **Espacios abiertos:** Elimina muros de carga internos para crear espacios flexibles e interconectados.
    - **Integración con el entorno:** Busca una relación fluida entre el interior y el exterior.`,
  "Escandinavo": `
    **STYLE GUIDELINES (Escandinavo):**
    - **Luz natural:** Maximizar la entrada de luz natural es fundamental debido a las largas noches de invierno en los países nórdicos. Esto se logra mediante grandes ventanales, puertas de cristal y tragaluces, a menudo sin cortinas pesadas.
    - **Funcionalidad y Simplicidad:** El diseño escandinavo evita la ornamentación excesiva, prefiriendo líneas limpias y rectas. Cada elemento tiene un propósito, lo que resulta en espacios organizados y despejados.
    - **Conexión con la Naturaleza:** Existe una relación armónica entre el interior y el exterior, a menudo integrando vistas del paisaje circundante y utilizando materiales naturales que reflejan el entorno.
    - **Comodidad y Calidez (Hygge):** A pesar del minimalismo, el estilo es inherentemente acogedor y cálido. Esto se consigue mediante el uso de texturas naturales y textiles (lana, algodón, lino) que añaden confort y una sensación de hogar. 
    - **Materiales Predominantes:** La selección de materiales se basa en su disponibilidad local y su capacidad para aportar calidez y naturalidad: 
        - **Madera:** Es el material predominante, utilizado tanto en la estructura como en revestimientos interiores y exteriores, a menudo en tonos claros como abedul o haya para potenciar la luminosidad.
        - **Colores Neutros:** La paleta de colores es principalmente blanca, gris y beige, con toques sutiles de tonos pastel, para reflejar la luz y crear una sensación de amplitud y serenidad.
        - **Otros Materiales Naturales:** La piedra, el cuero y los textiles naturales como la lana y el lino complementan la madera, añadiendo textura y confort a los espacios.`,
  "Industrial": `
    **STYLE GUIDELINES (Industrial):**
    - **Estructuras expuestas:** Muestra paredes de ladrillo visto, vigas de metal, columnas de hormigón y tuberías.
    - **Materiales crudos:** Predominan el acero, hierro, hormigón y madera sin tratar.
    - **Espacios amplios y diáfanos:** Techos altos y ausencia de divisiones, con grandes ventanales.
    - **Colores neutros:** Paleta centrada en blanco, negro, gris y marrón.
    - **Mobiliario con historia:** Emplea muebles de diseño antiguo con acabados artesanales, como madera maciza o cuero.
    - **Acabados envejecidos:** Valora texturas desgastadas, metales oxidados y cuero con pátina.`,
};

// FIX: Updated `style` parameter type to `string` to support custom styles.
const generateRedesignedImage = async (originalImagePart: any, style: string, roomType: string, userInstructions: string = ''): Promise<string> => {
  const ai = getGenAIInstance();
  // FIX: Provide a default guideline if the style is not one of the predefined DecorStyles.
  const styleGuideline = styleInstructions[style as DecorStyle] || `
    **STYLE GUIDELINES (${style}):**
    Genera una decoración que encarne la esencia de un estilo '${style}'. Sé creativo y fiel al estilo solicitado.
  `;

  const instructionPrompt = userInstructions ? `También ten en cuenta la siguiente instrucción del usuario: "${userInstructions}".` : '';

  const prompt = `Eres un experto diseñador de interiores virtual. Tu tarea es rediseñar la imagen del ${roomType} proporcionado en un estilo '${style}'.

**INSTRUCCIONES CRÍTICAS:**
1.  **MANTENER PERSPECTIVA:** La imagen de salida DEBE conservar exactamente el mismo ángulo de cámara, perspectiva, punto de vista e iluminación general que la imagen original. NO cambies la estructura de la habitación (paredes, ventanas, puertas).
2.  **REEMPLAZAR DECORACIÓN:** Sustituye todos los muebles y decoraciones existentes por elementos nuevos que se ajusten al estilo '${style}'.
${styleGuideline}
Considera que el ambiente es un ${roomType}.
${instructionPrompt}

Genera la imagen rediseñada basándote en estas instrucciones.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [originalImagePart, { text: prompt }] },
    config: { responseModalities: [Modality.IMAGE] },
  });

  const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (imagePart?.inlineData) {
        return imagePart.inlineData.data;
    }

    const finishReason = response.candidates?.[0]?.finishReason;
    if (finishReason === 'SAFETY' || finishReason === 'RECITATION' || !response.candidates || response.candidates.length === 0) {
        throw new Error(`No se pudo generar la imagen para el estilo ${style} debido a filtros de seguridad o a una respuesta vacía del modelo. Por favor, inténtalo de nuevo con otra imagen o un estilo diferente.`);
    }

  throw new Error(`Failed to generate redesigned image for style ${style}`);
};

// FIX: Updated `style` parameter type to `string` to support custom styles.
const generateMoodBoard = async (style: string): Promise<string> => {
    const ai = getGenAIInstance();
    const prompt = `Crea un 'mood board' fotorrealista para un estilo de diseño de interiores '${style}'. El mood board debe ser una composición que muestre muestras de telas, muestras de materiales, una paleta de colores y pequeños ejemplos de muebles y decoración icónicos de ese estilo. Es crucial que no haya absolutamente NINGÚN TEXTO en la imagen generada.`;
    
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: '4:3',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        return response.generatedImages[0].image.imageBytes;
    }
    throw new Error(`Failed to generate mood board for style ${style}`);
};

// MODIFIED: generateTextContent now takes the redesigned image part and roomType
// FIX: Updated `style` parameter type to `string` to support custom styles.
export const generateTextContent = async (redesignedImageBase64: string, style: string, roomType: string, userInstructions: string = ''): Promise<{ description: string; objectsUsed: string; furnitureRecommendation: string }> => {
  const ai = getGenAIInstance();
  const imagePart = base64ToGenerativePart(redesignedImageBase64);
  const instructionPrompt = userInstructions ? `Presta especial atención a la solicitud del usuario: "${userInstructions}".` : '';

  const prompt = `Eres un experto diseñador de interiores y redactor de contenidos para una app de diseño en español, dirigida a un público latinoamericano. Analiza la imagen rediseñada del ${roomType} proporcionado y, para el estilo '${style}', genera lo siguiente:
1.  **description**: Una descripción concisa y atractiva (máximo 50 palabras) del estilo tal como se aplica en esta imagen, destacando sus características clave para un ${roomType}.
2.  **objectsUsed**: Una lista de 3 a 5 objetos de mobiliario y/o decoración clave **visibles en la imagen** que se integrarían en este diseño para un ${roomType}, en formato de texto plano con un elemento por línea. No incluyas números ni viñetas. Ej: "Sofá modular gris\\nMesa de centro de madera\\nLámpara de pie de arco\\nAlfombra geométrica".
3.  **furnitureRecommendation**: Una lista de 3 a 5 sugerencias **adicionales y concretas** de objetos de mobiliario y decoración que complementarían este estilo para un ${roomType}, en formato de texto plano con un elemento por línea. No incluyas números ni viñetas. Estas deben ser sugerencias específicas de objetos. Ej: "Lámpara colgante de metal negro\\nAlfombra de yute con patrón geométrico blanco\\nJuego de mesas nido de madera de abedul\\nSillón individual con tapizado de lino gris".
${instructionPrompt}
Devuelve la respuesta como un objeto JSON con las claves "description", "objectsUsed" y "furnitureRecommendation".`;
  
  const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, { text: prompt }] }, // Pass both image and text prompt
      config: { responseMimeType: 'application/json' },
  });
  
  try {
    const cleanedText = response.text.replace(/^```json|```$/g, '').trim();
    const parsedContent = JSON.parse(cleanedText);
    return {
      description: parsedContent.description.trim(),
      objectsUsed: parsedContent.objectsUsed.trim(),
      furnitureRecommendation: parsedContent.furnitureRecommendation.trim(),
    };
  } catch (error) {
    console.error("Error parsing JSON from Gemini:", response.text, error);
    throw new Error(`No se pudo interpretar la descripción o los objetos del estilo '${style}'. La respuesta del modelo no era un JSON válido.`);
  }
};

export const extractColorPalette = async (redesignedImageBase64: string, style: string): Promise<string[]> => {
  const ai = getGenAIInstance();
  const imagePart = base64ToGenerativePart(redesignedImageBase64);
  const prompt = `Eres un experto en diseño de interiores. Analiza esta imagen rediseñada en estilo '${style}' y extrae una paleta de 4 a 6 colores dominantes en formato hexadecimal (ej. #RRGGBB). Estos colores deben reflejar la esencia y los tonos principales de la imagen.

Devuelve la respuesta como un objeto JSON con una clave 'colors' que contenga un array de strings.
Ejemplo de respuesta:
{"colors": ["#F0F8FF", "#8A2BE2", "#7FFF00", "#FFD700", "#FF6347", "#00CED1"]}
`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash', // Switched from gemini-2.5-flash-image to gemini-2.5-flash to support JSON mode
    contents: { parts: [imagePart, { text: prompt }] },
    config: { responseMimeType: 'application/json' },
  });

  try {
    const cleanedText = response.text.replace(/^```json|```$/g, '').trim();
    const parsedContent = JSON.parse(cleanedText);
    if (Array.isArray(parsedContent.colors) && parsedContent.colors.every((c: any) => typeof c === 'string' && c.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/))) {
      return parsedContent.colors;
    }
    throw new Error('Invalid color palette format.');
  } catch (error) {
    console.error("Error parsing JSON for color palette:", response.text, error);
    throw new Error(`No se pudo extraer la paleta de colores para el estilo '${style}'.`);
  }
};


const analyzeImage = async (imagePart: any): Promise<{ roomType: string; isValid: boolean; lowQuality: boolean }> => {
    const ai = getGenAIInstance();
    const prompt = `Analiza la imagen proporcionada. Determina si es una foto de un espacio interior de una habitación (como una sala de estar, dormitorio, cocina, etc.).
    También evalúa la calidad de la imagen (si es demasiado oscura, borrosa o pixelada para un análisis de diseño).

    Responde únicamente con un objeto JSON con las siguientes claves:
    - "isValid": boolean, true si es un espacio interior, false si no lo es (ej. un selfie, un paisaje).
    - "lowQuality": boolean, true si la calidad es demasiado baja para el análisis.
    - "roomType": string, el tipo de habitación detectado (ej. "Sala de estar", "Dormitorio"). Si no es válida, este valor puede ser null.
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash', // Switched from gemini-2.5-pro to gemini-2.5-flash for consistency and JSON support
        contents: { parts: [imagePart, {text: prompt}] },
        config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(response.text);
};

// FIX: Modified generateInitialProposals to return both the proposals and the detected roomType
export const generateInitialProposals = async (imageFile: File, userInstructions: string = ''): Promise<[Proposal[], string]> => {
  const originalImagePart = await fileToGenerativePart(imageFile);
  
  const analysis = await analyzeImage(originalImagePart);
  if (!analysis.isValid) {
      throw new Error("No se detectó un espacio interior. Por favor, sube una foto de la habitación que deseas transformar.");
  }
  if (analysis.lowQuality) {
      throw new Error("No pudimos analizar la imagen. Intenta con una foto más nítida o con mejor iluminación.");
  }
  
  const roomType = analysis.roomType || "espacio";

  const proposals: Proposal[] = await Promise.all(DECOR_STYLES.map(async (style) => {
    // `style` here is DecorStyle, which is assignable to `string` (the new parameter type)
    const redesignedImage = await generateRedesignedImage(originalImagePart, style, roomType, userInstructions); // Generate image first
    
    const [moodBoard, textContent, colorPalette] = await Promise.all([
      generateMoodBoard(style),
      generateTextContent(redesignedImage, style, roomType, userInstructions), // Pass redesignedImage here and user instructions
      extractColorPalette(redesignedImage, style),
    ]);

    return {
      style,
      redesignedImage,
      moodBoard,
      description: textContent.description,
      objectsUsed: textContent.objectsUsed, // Add this
      furnitureRecommendation: textContent.furnitureRecommendation, // Add this
      colorPalette, // Add this
    };
  }));

  return [proposals, roomType]; // FIX: Return both proposals and roomType
};

export const refineProposal = async (baseImage: string, instructions: string): Promise<string> => {
    const ai = getGenAIInstance();
    const imagePart = base64ToGenerativePart(baseImage);
    const prompt = `Eres un experto editor de imágenes de interiores. El usuario quiere modificar esta imagen de diseño.
Su instrucción es: "${instructions}".
Aplica este cambio con precisión utilizando técnicas de inpainting/edición. Modifica únicamente los elementos solicitados. Por ejemplo, si te piden cambiar el sofá, cambia solo el sofá y nada más. Conserva el resto de la imagen perfectamente intacta.
Genera la imagen editada.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [imagePart, { text: prompt }] },
        config: { responseModalities: [Modality.IMAGE] },
    });

    const imagePartResponse = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (imagePartResponse?.inlineData) {
        return imagePartResponse.inlineData.data;
    }

    const finishReason = response.candidates?.[0]?.finishReason;
    if (finishReason === 'SAFETY' || finishReason === 'RECITATION' || !response.candidates || response.candidates.length === 0) {
        throw new Error("No se pudo refinar la imagen debido a filtros de seguridad o a una respuesta vacía del modelo. Por favor, intenta con una instrucción diferente.");
    }

    throw new Error("Failed to refine the image.");
};

// FIX: Simplified `generateNewStyle` by removing temporary type assertions and `styleInstructions` modifications.
// The called functions now correctly accept `string` for style.
export const generateNewStyle = async (originalImageFile: File, newStyle: string, roomType: string): Promise<Proposal> => {
    if (!originalImageFile) throw new Error("Original image file not found for new style generation.");

    const originalImagePart = await fileToGenerativePart(originalImageFile);
    
    // The functions now correctly accept `string` for style, no temporary type casting needed.
    // For generating a new style, we don't have user instructions for the *new* style,
    // so we pass an empty string here. The newStyle itself acts as the primary instruction.
    const redesignedImage = await generateRedesignedImage(originalImagePart, newStyle, roomType, ''); 

    const [moodBoard, textContent, colorPalette] = await Promise.all([
      generateMoodBoard(newStyle),
      generateTextContent(redesignedImage, newStyle, roomType, ''), // Pass empty string for instructions
      extractColorPalette(redesignedImage, newStyle),
    ]);
    
    // No temporary style addition or cleanup needed
    // if (!DECOR_STYLES.includes(newStyle as DecorStyle)) {
    //     (styleInstructions as any)[newStyle] = `**STYLE GUIDELINES (${newStyle}):** Genera una decoración que encarne la esencia de un estilo '${newStyle}'. Sé creativo y fiel al estilo solicitado.`;
    // }
    // ...
    // if (!DECOR_STYLES.includes(newStyle as DecorStyle)) {
    //     delete (styleInstructions as any)[newStyle];
    // }

    return {
        style: newStyle,
        redesignedImage,
        moodBoard,
        description: textContent.description,
        objectsUsed: textContent.objectsUsed, // Add this
        furnitureRecommendation: textContent.furnitureRecommendation, // Add this
        colorPalette, // Add this
    };
};