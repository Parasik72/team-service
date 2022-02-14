'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.bulkInsert('User', [
			{ id: '1', email: 'admin@test.com', login: 'Admin', password: await bcrypt.hash('Admin', 5), firstName: 'Admin', lastName: 'Admin' },
		]);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete('User', null, {});
	}
};
