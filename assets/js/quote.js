$(document).ready(function () {
    $("#numElev_2, #numElev_3, #elevPriceUnit, #elevTotal, #installationFee, #total_").attr('readonly', true);

    var numApp, numFloors, numBase, maxOcc;
    var prodRange = {
        type: null,
        price: null,
        installationFeePercentage: null
        
    };

    //On touche pas
    $('.formField').on('keyup', function () {
        doCalc();
    });


    //Correction, standard avec (d) à la fin et non avec (t). On doit aussi appeler les autres variables elevPriceUnit en fonction du bouton radio
    $('#standard').on('click', function() {


        document.getElementById('elevPriceUnit').value = (7565).toFixed(2) + " $";
        doCalc();
    });

    $('#premium').on('click', function () {


        document.getElementById('elevPriceUnit').value = (12345).toFixed(2) + " $";
        doCalc();
    });


    $('#excelium').on('click', function () {


        document.getElementById('elevPriceUnit').value = (15400).toFixed(2) + " $";
        doCalc();
    });
    // fin de la correction 2


    //On touche pas

    $('#residential, #commercial, #corporate, #hybrid').on('click', function () {
        initialize();
    });


    function initialize() {
        $('.formField').val('');
        $('.productRangeBtn').prop('checked', false);
    };


    // l'erreure ici c'est que la value a l'interieur n'est jamais lu.
    function getInfoNumApp() {
        numApp = $('#numApp').val();
    };

    function getInfoNumFloors() {
        numFloors = $('#numFloors').val();
    };

    function getInfoNumBase() {
        numBase = $('#numBase').val();
    };

    function getInfoNumElev() {
        numElev = $('#numElev').val();
    };

    function getInfoMaxOcc() {
        maxOcc = $('#maxOcc').val();
    };

    function getProdRange() {
        if ($('#standard').is(':checked')) {
            prodRange.type = "standard";
            prodRange.price = parseFloat(7565);
            prodRange.installationFeePercentage = 0.1;
            return prodRange;


            //il y'a une erreure ici, il y'a un 6 de trop.
        } else if ($('#premium').is(':checked')) {
            prodRange.type = "premium";
            prodRange.price = parseFloat(12345);
            prodRange.installationFeePercentage = 0.13;
            return prodRange;

        } else if ($('#excelium').is(':checked')) {
            prodRange.type = "excelium";
            prodRange.price = parseFloat(15400);
            prodRange.installationFeePercentage = 0.16;
            return prodRange;
        } else {
            prodRange.type = null,
                prodRange.price = null,
                prodRange.installationFeePercentage = null
            return prodRange;
        }
    };

    function GetInfos() {
        //Etant donné que la valeur de la fonction getInfoNumApp n'est jamais lu en haut, on doit l'appeler ici
        getInfoNumApp();
        getInfoNumFloors();
        getInfoNumBase();
        getInfoNumElev();
        getInfoMaxOcc();
        getProdRange();
    };

    function setRequiredElevatorsResult(finNumElev) {
        $("#numElev_2, #numElev_3").val(parseFloat(finNumElev));
    };

    //finNumElev n'est pas appeler ici dans la fonction, j'ai rajouter $("#numElev_2, #numElev_3").val(parseFloat(finNumElev));
    function setPricesResults(finNumElev, roughTotal, installFee, total) {
        $("#numElev_2, #numElev_3").val(parseFloat(finNumElev));
        $("#elevTotal").val(parseFloat(roughTotal).toFixed(2) + " $");
        $("#installationFee").val(parseFloat(installFee).toFixed(2) + " $");
        $("#total_").val(parseFloat(total).toFixed(2) + " $");
    };

    function emptyElevatorsNumberAndPricesFields() {
        $('#numElev_3').val('');
        //faut que les deux inputs sur le nombre d'elevateur se renitialise.
        $('#numElev_2').val('');

        $('.priceField').val('');

        //Faut que le unit price disparait aussi lorsqu'on arrete de mettre des données.
        $('#elevPriceUnit').val('');
    };

    function createFormData(projectType) {
        return {
            // ici on doit ajouter numberElev qu'on a oublier d'appeler et en ajouter une , a projectype
            numberApp: numApp,
            numberFloors: numFloors,
            numberBase: numBase,
            maximumOcc: maxOcc,
            productRange: prodRange,
            projectType: projectType,
            numberElev : numElev
        }
    };

    function negativeValues() {
        if ($('#numApp').val() < 0) {

            alert("Please enter a positive number!");
            $('#numApp').val('');
            return true

        } else if ($('#numBase').val() < 0) {

            alert("Please enter a positive number!");
            $('#numBase').val('');
            return true

        } else if ($('#numComp').val() < 0) {

            alert("Please enter a positive number!");
            $('#numComp').val('');
            return true

        } else if ($('#numPark').val() < 0) {

            alert("Please enter a positive number!");
            $('#numPark').val('');
            return true

        } else if ($('#numElev').val() < 0) {

            alert("Please enter a positive number!");
            $('#numElev').val('');
            return true

        } else if ($('#numCorpo').val() < 0) {

            alert("Please enter a positive number!");
            $('#numCorpo').val('');
            return true

        } else if ($('#maxOcc').val() < 0) {

            alert("Please enter a positive number!");
            $('#maxOcc').val('');
            return true
       // le nombre de floor aussi doit etre positif 
        } else if ($('#numFloors').val() < 0) {

            alert("Please enter a positive number!");
            $('#numFloors').val('');
            return true
        } 
        else {
            return false
        }
    };

    function apiCall(projectType) {
        //Getting numbers from quote
        GetInfos();

        //Preparing data for Api call
        formData = createFormData(projectType)

        $.ajax({
            type: "POST",
            // url: 'http://localhost:3000/api/quoteCalculation/', //for local testing
            url: 'https://rocketelevators-quote.herokuapp.com/api/quoteCalculation/',
            data: JSON.stringify(formData),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data) {
                setRequiredElevatorsResult(data.finalNumElev);
                if (prodRange.type != null) {
                    setPricesResults(data.finalNumElev, data.subTotal, data.installationFee, data.grandTotal);
                }
            }
        });
    }


    
    function doCalc() {
        
        if ($('#residential').hasClass('active') && !negativeValues() && $('#numApp').val() && $('#numFloors').val()) {
            apiCall('residential');
            // On enleve le nombre de parking qu'on a pas besoin dans le commerciale étant donnée que c'est pas un critère.
        } else if ($('#commercial').hasClass('active') && !negativeValues() && $('#numElev').val()) {
            apiCall('commercial');
           
            //Ici l'erreur, c'est qu'on appel en apiCall le commercial, alors qu'on doit appeler corporate à la place.
        } else if ($('#corporate').hasClass('active') && !negativeValues() && $('#numFloors').val() && $('#numBase').val() && $('#maxOcc').val()) {
            apiCall('corporate');
            
            
            // On doit aussi appeler a faire le calcul concerant l'hybrid sinon il ne le fera pas

        } else if ($('#hybrid').hasClass('active') && !negativeValues() && $('#numFloors').val() && $('#numBase').val() && $('#maxOcc').val()) {
            apiCall('hybrid');
            
        } else {
            emptyElevatorsNumberAndPricesFields();
        };
    };
});
