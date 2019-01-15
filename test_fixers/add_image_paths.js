const config = require('../__tests__/routes.postman_collection.json');
const fs = require('fs');

// Group test suite
const group_tests = config.item[config.item.findIndex(item => item.name === '[/groups] Group features')];
const event_tests = config.item[config.item.findIndex(item => item.name === '[/events] Event features')];
const user_tests = config.item[config.item.findIndex(item => item.name === '[/users] User Features')];

const group_upload_ok_image = group_tests.item[group_tests.item.findIndex(item => item.name === 'Group PB upload image')];
const group_upload_large_image = group_tests.item[group_tests.item.findIndex(item => item.name === 'Group PB upload image too large')];

group_upload_ok_image.request.body.formdata[0].src = '__tests__/images/group.jpg';
group_upload_large_image.request.body.formdata[0].src = '__tests__/images/large.jpg';

const event_upload_ok_image = event_tests.item[event_tests.item.findIndex(item => item.name === 'POST Event upload image')];
const event_upload_large_image = event_tests.item[event_tests.item.findIndex(item => item.name === 'POST Event upload image too large')];

event_upload_ok_image.request.body.formdata[0].src = '__tests__/images/group.jpg';
event_upload_large_image.request.body.formdata[0].src = '__tests__/images/large.jpg';

const user_upload_ok_image = user_tests.item[user_tests.item.findIndex(item => item.name === 'POST User upload image')];
const user_upload_large_image = user_tests.item[user_tests.item.findIndex(item => item.name === 'POST User upload image too large')];

user_upload_ok_image.request.body.formdata[0].src = '__tests__/images/group.jpg';
user_upload_large_image.request.body.formdata[0].src = '__tests__/images/large.jpg';


fs.writeFileSync('../__tests__/routes.postman_collection.json', JSON.stringify(config, null, 4));
