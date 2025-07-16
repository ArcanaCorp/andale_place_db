import pool from "../db/db.js"
import { scrapeMinceturFicha } from "../utils/scrapping.js"

export const controllerListPlaces = async (req, res) => {

    const { limit } = req.query;

    console.log(`QUERY: ${limit}`);

    try {
        
        let sql = `SELECT * FROM places`

        // Validar y agregar LIMIT si es un número positivo
        if (limit && !isNaN(limit) && parseInt(limit) > 0) {
            sql += ` LIMIT ${parseInt(limit)}`;
        }

        const [ result ] = await pool.query(sql)

        if (result.length === 0) return res.status(404).json({ ok: false, message: 'No se encontraron lugares', code: 404 })

            const places = result.map((r) => {
                return {
                    id: r.id_place,
                    sub: r.sub_place,
                    name: r.name_place,
                    text: r.text_place,
                    category: r.category_place,
                    location: r.locationName_place,
                    cors: r.location_place,
                    services: JSON.parse(r.services_place),
                    schedule: r.schedule_place,
                    price: r.price_place,
                    access: JSON.parse(r.access_place),
                    recommended: r.recommended_time,
                    activities: JSON.parse(r.activities_place),
                    created: r.created_place,
                }
            })

            return res.status(200).json({ ok: true, message: 'Lugares encontrados', places: places, code: 200 })

    } catch (error) {
        return res.status(500).json({ ok: false, message: 'Hubo un error interno en el servidor. Intentalo más tarde', error: error, code: 500 })
    }

}

export const controllerListSections = async (req, res) => {
    try {
        const sql = `
            SELECT 
                p.sub_place, 
                p.name_place, 
                p.text_place, 
                p.category_place, 
                p.locationName_place, 
                ip.image_iplaces 
            FROM places p 
            LEFT JOIN images_places ip 
            ON p.sub_place = ip.sub_place
        `;
        const [rows] = await pool.query(sql);

        const grouped = {};

        for (const row of rows) {
            const category = row.category_place || 'Sin categoría';

            if (!grouped[category]) grouped[category] = {};

            if (!grouped[category][row.sub_place]) {
                grouped[category][row.sub_place] = {
                    slug: row.sub_place,
                    name: row.name_place,
                    location: row.locationName_place,
                    image: row.image_iplaces || 'URL_ADDRESS'
                };
            }
        }

        // Convertir cada grupo (objeto) a array y aplicar .sort y .slice
        const sliderData = Object.entries(grouped).map(([category, placesObj], index) => {
            const places = Object.values(placesObj);
            return {
                id: index + 1,
                theme: category,
                places: places.sort(() => 0.5 - Math.random()).slice(0, 5)
            };
        });

        return res.status(200).json({ ok: true, data: sliderData });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({
            ok: false,
            message: 'Hubo un error interno en el servidor. Inténtalo más tarde',
            error: error.message,
            code: 500
        });
    }
};

export const controllerSlugPlace = async (req, res) => {

    const { slug } = req.params;

    if (!slug) return res.status(404).json({ok: false, message: `No se encontró el lugar con el slug ${slug}`, code: 404})

        try {
            
            const sql = 'SELECT * FROM places WHERE sub_place = ?'
            const [ places ] = await pool.query(sql, [slug])

            if (places.length === 0) return res.status(404).json({ ok: false, message: 'No se encontraron lugares', code: 404 })

                // Consulta para obtener imágenes relacionadas
                const imagesQuery = 'SELECT image_iplaces FROM images_places WHERE sub_place = ?';
                const [imagesResult] = await pool.query(imagesQuery, [slug]);

                const place = places[0];
                place.images = imagesResult; 

                return res.status(200).json({ ok: true, message: 'Lugar encontrado', place: place, code: 200 })

        } catch (error) {
            return res.status(500).json({ok: false, message: 'Hubo un error interno en el servidor.', code: 500})
        }

}

export const controllerSubPlace = async (req, res) => {
    
    const { sub } = req.params;
    
    try {
        
        if (!sub) return res.status(404).json({ok: false, message: `No se recibio el sub`, error: '', code: 404})

            const data = await scrapeMinceturFicha(sub);

            return res.status(201).json({ok: true, data: data, message: 'Datos'})

    } catch (error) {
        return res.status(500).json({ok: false, message: error.message, error: error, code: 500})
    }

}