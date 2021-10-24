/**
 * @module reports/patient.receipt
 *
 * @description
 * This module provides rendering for the patient receipt: a patient card.
 * A new patient card is automatically generated when the patient is registered
 * at the Patient Registration module.  Additionally, copies can be printed from
 * the Patient Record page.
 *
 * @requires Patients
 * @requires lodash
 * @requires lib/ReportManager
 */

const _ = require('lodash');
const path = require('path');
const Patients = require('../patients');
const ReportManager = require('../../../lib/ReportManager');
const Locations = require('../../admin/locations');
const barcode = require('../../../lib/barcode');
const identifiers = require('../../../config/identifiers');

const entityIdentifier = identifiers.PATIENT.key;

// detailed patient identification - flag to determine if small or larger form
const CARD_TEMPLATE = path.join(__dirname, 'patient.receipt.handlebars');
const CUSTOMER_CARD_TEMPLATE = path.join(__dirname, 'customer.receipt.handlebars');
// POS receipt, quick proof of registration
const POS_TEMPLATE = path.join(__dirname, 'patient.pos.handlebars');

// A4 Fiche Template
const FICHE_TEMPLATE = path.join(__dirname, 'patient.fiche.handlebars');

// A4 Fiche Template for customer
const CUSTOMER_FICHE_TEMPLATE = path.join(__dirname, 'customer.fiche.handlebars');

// default options for the patient card
const defaults = {
  format: 'A6',
  landscape: true,
};

exports.build = build;

async function build(req, res, next) {
  const qs = req.query;
  const options = _.defaults(qs, defaults);

 
  const requestedPOSReceipt = Boolean(Number(options.posReceipt));
  const requestedSimplifiedCard = Boolean(Number(options.simplified));
  const requestedA4Fiche = Boolean(Number(options.fiche));



  try {
   
    const patient = await Patients.lookupPatient(req.params.uuid);
    

    // if the POS option is selected, render a thermal receipt.
    const isCustomer = !!patient.is_customer;
    let template = isCustomer ? CUSTOMER_CARD_TEMPLATE : CARD_TEMPLATE;
    if (requestedPOSReceipt) {
      template = POS_TEMPLATE;
    } else if (requestedA4Fiche) {
      template = isCustomer ? CUSTOMER_FICHE_TEMPLATE : FICHE_TEMPLATE;
      options.format = 'A4';
      options.landscape = false;
    }
    const report = new ReportManager(template, req.session, options);
    
    patient.barcode = barcode.generate(entityIdentifier, patient.uuid);

    patient.enterprise_name = req.session.enterprise.name;
    patient.sexFormatted = (patient.sex === 'M') ? 'FORM.LABELS.MALE' : 'FORM.LABELS.FEMALE';

    const [village, currentVillage] = await Promise.all([
      Locations.lookupVillage(patient.origin_location_id),
      Locations.lookupVillage(patient.current_location_id),
    ]);

    const result = await report.render({
      patient, village, currentVillage, simplified: requestedSimplifiedCard,
    });

    res.set(result.headers).send(result.report);
  } catch (e) {
    next(e);
  }
}
