const Status = require('./Status');
const Project = require('./Project');
const Request = require('./Request');

Request.belongsTo(Status, { foreignKey: 'statusId' });

Request.belongsTo(Project, { foreignKey: 'projectId' });

Project.hasMany(Request, { foreignKey: 'projectId' });

module.exports = {
  Status,
  Project,
  Request
};