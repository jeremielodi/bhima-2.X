angular.module('bhima.routes')
  .config(['$stateProvider', $stateProvider => {
    $stateProvider
      .state('customersRegister', {
        url         : '/customer/register',
        controller  : 'CustomerRegistrationController as PatientRegCtrl',
        templateUrl : 'modules/customer/registration/registration.html',
      })

 
      .state('customerRegistry', {
        url         : '/customers',
        controller  : 'CustomerRegistryController as PatientRegistryCtrl',
        templateUrl : '/modules/customer/registry/registry.html',
        params      : {
          filters : [],
        },
      })
      
      .state('customerEdit', {
        url         : '/customer/:uuid/edit',
        controller  : 'CustomerEdit as PatientEditCtrl',
        templateUrl : 'modules/customer/edit/edit.html',
      })


  }]);

function mergePatientsModal($modal, $transition) {
  $modal.open({
    templateUrl : 'modules/patients/registry/modals/mergePatients.modal.html',
    controller : 'MergePatientsModalController as MergePatientsModalCtrl',
    resolve : { params : () => $transition.params('to') },
  }).result.catch(angular.noop);
}

function closeModal(ModalStack) {
  ModalStack.dismissAll();
}
