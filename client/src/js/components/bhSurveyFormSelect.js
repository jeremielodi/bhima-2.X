angular.module('bhima.components')
  .component('bhSurveyFormSelect', {
    templateUrl : 'modules/templates/bhSurveyFormSelect.tmpl.html',
    controller  : SurveyFormSelectController,
    transclude  : true,
    bindings    : {
      form : '<?',
      onSelectCallback : '&',
      required         : '<?',
      label            : '@?',
    },
  });

SurveyFormSelectController.$inject = [
  'DataCollectorManagementService', 'NotifyService',
];

/**
 * Survey Form Select Controller
 */
function SurveyFormSelectController(DataCollectorManagement, Notify) {
  const $ctrl = this;

  // fired at the beginning of the Survey Form Select
  $ctrl.$onInit = function $onInit() {
    // translated label for the form input
    $ctrl.label = $ctrl.label || 'FORM.LABELS.FORM';

    if (!angular.isDefined($ctrl.required)) {
      $ctrl.required = true;
    }

    DataCollectorManagement.read()
      .then(surveyForms => {
        $ctrl.surveyForms = surveyForms;
      })
      .catch(Notify.handleError);
  };

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = surveyForm => {
    $ctrl.onSelectCallback({ surveyForm });
  };
}
