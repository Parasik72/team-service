'use strict';
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn('User', 'roleId', { 
			type: Sequelize.STRING,
			allowNull: false,
			references: {
				model: 'Role',
				key: 'id'
			},
			onUpdate: 'CASCADE',
        	onDelete: 'CASCADE'
		})
		// await queryInterface.createTable('UserRole', {
		// 	id: {
		// 		type: Sequelize.INTEGER, 
		// 		unique: true,
		// 		autoIncrement: true,
		// 		primaryKey: true
		// 	},
		// 	roleId: {
		// 		type: Sequelize.STRING,
		// 		allowNull: false,
		// 		references: {         
		// 			model: 'Role',
		// 			key: 'id'
		// 		},
		// 		onUpdate: 'CASCADE',
        // 		onDelete: 'CASCADE'
		// 	},
		// 	userId: {
		// 		type: Sequelize.STRING,
		// 		allowNull: false,
		// 		references: {
		// 			model: 'User',
		// 			key: 'id'
		// 		},
		// 		onUpdate: 'CASCADE',
        // 		onDelete: 'CASCADE'
		// 	}
		// });
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.removeColumn('User', 'roleId');
		// await queryInterface.dropTable('UserRole');
	}
};