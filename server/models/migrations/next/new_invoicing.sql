-- units
INSERT INTO unit VALUES
(304,'Customer','INVOICING.CUSTOMER','The Customer Super-Category',0,'/CUSTOMER_FOLDER'),
(305,'Customer Registration','INVOICING.CUSTOMER_REGISTER','Register customers',304,'/customer/register'),
(306,'Customer Registry','INVOICING.CUSTOMER_REGISTRY','Customer Registry',304,'/customers');


ALTER TABLE `patient` ADD `is_customer` TINYINT(2) DEFAULT 0;

ALTER TABLE `patient` CHANGE `origin_location_id` `origin_location_id` BINARY(16)  NULL;
ALTER TABLE `patient` CHANGE `current_location_id`  `current_location_id` BINARY(16)  NULL;