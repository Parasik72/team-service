'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.bulkInsert('Role', [
			{ id: '1', value: 'ADMIN' }
		]);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete('Role', null, {});
	}
};
