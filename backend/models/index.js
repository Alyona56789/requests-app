const Status = require('./Status');
const Project = require('./Project');
const Request = require('./Request');


Project.hasMany(Request, { foreignKey: 'projectId' });

Request.belongsTo(Project, { foreignKey: 'projectId' });

Status.hasMany(Request, { foreignKey: 'statusId' });

Request.belongsTo(Status, { foreignKey: 'statusId' });

module.exports = {
  Status,
  Project,
  Request
};