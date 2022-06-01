const TagModel = require('../models/data/tag-model');

exports.getTags = async (req, res) => {
	const tags = await TagModel.findAll({
		order: [
			['title', 'ASC'],
		],
	});

	res.json({
		items: tags,
	});
};
