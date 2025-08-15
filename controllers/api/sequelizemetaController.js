const Sequelizemeta = require('../../models/Sequelizemeta');
const storeSequelizemeta = async (req, res) => {
    let { task_id,remind_at,is_sent } = req.body;
    const sequelizemeta = Sequelizemeta.fill({ task_id,remind_at,is_sent });
    await sequelizemeta.insert()
    res.json(
        {
            status: 'success',
            message: 'Sequelizemeta added successfully',
            data: sequelizemeta
        }
    )
}

const getSequelizemetas = async (req, res) => {
    const sequelizemetas = await Sequelizemeta.fetch();
    res.json(
        {
            status: 'success',
            message: 'Sequelizemetas fetched successfully',
            data: sequelizemetas
        }
    )
}

const getSequelizemetaById = async (req, res) => {
    let { id } = req.params;
    const sequelizemeta = await Sequelizemeta.find(id);
    if (!sequelizemeta) {
        return res.status(404).json(
            {
                status: 'error',
                message: 'Sequelizemeta not found'
            }
        )
    }
    res.json(
        {
            status: 'success',
            message: 'Sequelizemeta fetched successfully',
            data: sequelizemeta
        }
    )
}

// const updateSequelizemeta = async (req, res) => {
//     let { id } = req.params;
//     let { name, description, tuition } = req.body;
//     const sequelizemeta = await Sequelizemeta.find(id);
//     if (!sequelizemeta) {
//         return res.status(404).json(
//             {
//                 status: 'error',
//                 message: 'Sequelizemeta not found'
//             }
//         )
//     }
//     sequelizemeta.fill({ name, description, tuition });

//     await sequelizemeta.update();

//     res.json(
//         {
//             status: 'success',
//             message: 'Sequelizemeta updated successfully',
//             data: sequelizemeta
//         }
//     )
// }

const partialSequelizemetaUpdate = async (req, res) => {
    let { id } = req.params;
    const sequelizemeta = await Sequelizemeta.find(id);
    if (!sequelizemeta) {
        return res.status(404).json(
            {
                status: 'error',
                message: 'Sequelizemeta not found'
            }
        )
    }
    sequelizemeta.fill(req.body);

    await sequelizemeta.update();

    res.json(
        {
            status: 'success',
            message: 'Sequelizemeta updated successfully',
            data: sequelizemeta
        }
    )
}

const deleteSequelizemeta = async (req, res) => {
    let { id } = req.params;
    const deleted = await Sequelizemeta.delete(id);
    if (!deleted) {
        return res.status(404).json(
            {
                status: 'error',
                message: 'Failed to delete sequelizemeta'
            }
        )
    }

    res.json(
        {
            status: 'success',
            message: 'Sequelizemeta deleted successfully',
        }
    )
}


module.exports = {
    storeSequelizemeta,
    getSequelizemetas,
    getSequelizemetaById,
    // updateSequelizemeta,
    partialSequelizemetaUpdate,
    deleteSequelizemeta,
    
}