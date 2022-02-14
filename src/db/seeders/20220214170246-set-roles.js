'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.bulkInsert('UserRole', [
			{ id: '-1', roleId: '1', userId: '1' },
		]);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete('UserRole', null, {});
	}
};
