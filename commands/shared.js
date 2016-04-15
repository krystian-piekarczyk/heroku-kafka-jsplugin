'use strict';

const _ = require('underscore');

const validTopicRegex = /^[a-zA-Z0-9\\._\\-]+$/;
const adminTopics = ["__consumer_offsets"];

function collidesWithExistingTopics(topicName, existingTopics) {
  var replaced = topicName.replace(/\./g, '_');
  for (var i = 0; i < existingTopics.length; i++) {
    if (replaced === existingTopics[i].replace(/\./g, '_')) {
      return true;
    }
  }
  return false;
}

function checkValidTopicName(topicName, existingTopics) {
  if (topicName.length <= 0) {
    return {invalid: true, message: "length must be greater than 0"};
  } else if (topicName === "." || topicName === "..") {
    return {invalid: true, message: "topic name must not be '.' or '..'"};
  } else if (topicName.length > 255) {
    return {invalid: true, message: "topic names can't be longer than 255 chars"};
  } else if (!topicName.match(validTopicRegex)) {
    return {invalid: true, message: "topic name contains characters other than ASCII alphanumerics, '.', '_', and '-'"};
  } else if (collidesWithExistingTopics(topicName, existingTopics)) {
    return {invalid: true, message: "topic name collids with existing topics"};
  } else {
    return {invalid: false};
  }
}

function checkValidTopicNameForDeletion(topicName, existingTopics) {
  if (existingTopics.indexOf(topicName) === -1) {
    return {invalid: true, message: "topic must be an existing topic"};
  } else if (adminTopics.indexOf(topicName) !== -1) {
    return {invalid: true, message: "topic cannot be an admin topic"};
  } else {
    return {invalid: false};
  }
}

function clusterConfig(addon, config) {
  if (!addon) {
    return null;
  }
  let urlVar = _.find(addon.config_vars, function(key) {
    return key.match(/KAFKA_URL|HEROKU_KAFKA_[A-Z]+_URL/);
  });
  let trustedCertVar = _.find(addon.config_vars, function(key) {
    return key.match(/KAFKA_TRUSTED_CERT|HEROKU_KAFKA_[A-Z]+_TRUSTED_CERT/);
  });
  let clientCertVar = _.find(addon.config_vars, function(key) {
    return key.match(/KAFKA_CLIENT_CERT|HEROKU_KAFKA_[A-Z]+_CLIENT_CERT/);
  });
  let clientCertKeyVar = _.find(addon.config_vars, function(key) {
    return key.match(/KAFKA_CLIENT_CERT_KEY|HEROKU_KAFKA_[A-Z]+_CLIENT_CERT_KEY/);
  });
  return {
    url: config[urlVar],
    trustedCert: config[trustedCertVar],
    clientCert: config[clientCertVar],
    clientCertKey: config[clientCertKeyVar]
  };
}

module.exports = {
  checkValidTopicName : checkValidTopicName,
  checkValidTopicNameForDeletion: checkValidTopicNameForDeletion,
  clusterConfig: clusterConfig
};
