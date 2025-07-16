import pool from "../db/db.js"
import path from 'path';
import fs from 'fs';

export const controllerListRouters = async (req, res) => {

    try {
        
        const sql = 'SELECT * FROM routes_places ORDER BY id_router DESC'
        const [ result ] = await pool.query(sql)

        if (result.length === 0) return res.status(404).json({ ok: false, message: 'No se encontraron rutas', code: 404, length: result.length })

            const rutas = result.map((r) => ({
                id: r.id_router,
                sub: r.sub_router,
                name: r.name_router,
                text: r.text_router,
                places: r.places_router || [],
                image: `http://localhost:5000/api/v1/routes/image/${r.sub_router}/${r.image_router}`,
                created: r.created_router,
            }));

            return res.status(200).json({ ok: true, message: 'Rutas encontrados', rutas: rutas, code: 200, length: result.length })

    } catch (error) {
        return res.status(500).json({ ok: false, message: 'Hubo un error interno en el servidor. Intentalo más tarde', error: error, code: 500 })
    }

}

export const controllerImageRouters = async (req, res) => {
    const { sub, image } = req.params;

    try {
        // Construir la ruta absoluta a la imagen
        const imagePath = path.join(process.cwd(), 'routers', sub, image);

        // Verificar si la imagen existe
        if (fs.existsSync(imagePath)) {
            // Enviar la imagen
            return res.sendFile(imagePath);
        } else {
            return res.status(404).json({ error: 'Imagen no encontrada' });
        }
    } catch (error) {
        console.error('Error al servir la imagen:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
};
