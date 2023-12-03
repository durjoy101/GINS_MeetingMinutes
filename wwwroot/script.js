
    $(document).ready(function () {
        // Initial API URL with a placeholder for the radio button value
        var customerApiEndpoint = 'http://localhost:5072/api/MeetingDetails/customerName?Type=';
        var productApiEndpoint = 'http://localhost:5072/api/MeetingDetails/productService';
        var saveMeetingMinutesApiEndpoint = 'http://localhost:5072/api/MeetingDetails/saveMeetingMinutes';

        debugger
        var test = $('input[name="inlineRadioOptions"]:checked').val();
        var rowCount = 0;

        $('input[name="inlineRadioOptions"]').change(function () {
            fetchCustomerData();
        });

        // Attach a change event listener to the product dropdown
        $('#interestedProduct').change(function () {
            debugger
            // Get the selected product index
            var selectedProductName = $(this).val();

            // Update the unit value based on the selected product
            if (selectedProductName !== '') {
                var selectedProduct = productData.find(item => item.product === selectedProductName);
                $('#unit').val(selectedProduct.unit);
            } else {
                // If no product is selected, clear the unit value
                $('#unit').val('');
            }
        });

        // Function to populate the customer dropdown with data
        function populateCustomerDropdown(customerData) {
            var dropdown = $('#customerDropdown');

            // Clear existing options
            dropdown.empty();

            // Add default option
            dropdown.append('<option value="">select customer name</option>');

            // Loop through the customer data and add options to the dropdown
            $.each(customerData, function (index, item) {
                dropdown.append('<option value="' + item.customerName + '">' + item.customerName + '</option>');
            });
        }

        // Function to fetch product data and populate the product dropdown
        function fetchProductData() {
            $.ajax({
                url: productApiEndpoint,
                method: 'GET',
                dataType: 'json',
                success: function (data) {
                    // Store product data in the variable
                    productData = data;

                    // Populate the product dropdown with fetched data
                    populateProductDropdown();
                },
                error: function (error) {
                    console.error('Error fetching product data:', error);
                }
            });
        }

        // Function to fetch customer data and populate the customer dropdown
        function fetchCustomerData() {
            // Get the selected radio button value
            var radioValue = $('input[name="inlineRadioOptions"]:checked').val();

            // Update the API URL with the selected radio button value for customer
            var updatedCustomerApiEndpoint = customerApiEndpoint + radioValue;

            // Make an AJAX call to fetch customer data using the updated API URL
            $.ajax({
                url: updatedCustomerApiEndpoint,
                method: 'GET',
                dataType: 'json',
                success: function (customerData) {
                    // Populate the customer dropdown with fetched data
                    populateCustomerDropdown(customerData);
                },
                error: function (error) {
                    console.error('Error fetching customer data:', error);
                }
            });
        }

        // Function to populate the product dropdown with data
        function populateProductDropdown() {
            var dropdown = $('#interestedProduct');

            // Clear existing options
            dropdown.empty();

            // Add default option
            dropdown.append('<option disabled value="" selected>select product/service inserted</option>');

            // Loop through the product data and add options to the dropdown
            $.each(productData, function (index, item) {
                dropdown.append('<option value="' + item.product + '">' + item.product + '</option>');
            });
        }

        

        // Attach a click event listener to the + Add button
        $('#addButton').click(function () {
            addRowToTable();
        });

        // Use event delegation to handle delete button clicks
        $('#dataTable').on('click', '.delete-button', function () {
            deleteRow(this);
        });

        // Function to add a row to the table
        function addRowToTable() {
            debugger

            rowCount++;

            var productName = $('#interestedProduct').val();
            var quantity = $('#quantity').val();
            var unit = $('#unit').val();

            // Add a new row to the table
            var newRow = '<tr>' +
                '<td class="serial-number">' + rowCount + '</td>' +
                '<td class="product-service">' + productName + '</td>' +
                '<td class="quantity">' + quantity + '</td>' +
                '<td class="unit">' + unit + '</td>' +
                '<td><button class="btn btn-warning btn-sm">Edit</button></td>' +
                '<td><button class="btn btn-danger btn-sm delete-button">Delete</button></td>' +
                '</tr>';

            // Remove the "No matching record found" row if it exists
            if (rowCount == 1) {
                $('#dataTable tbody tr').remove();
            }


            // Append the new row to the table
            $('#dataTable tbody').append(newRow);

            // Clear input fields after adding a row
            $('#interestedProduct').val('');
            $('#quantity').val('');
            $('#unit').val('');
        }

        function deleteRow(button) {
            debugger
            // Get the row to be deleted
            var row = $(button).closest('tr');

            // Delete the row
            row.remove();

            // Update serial numbers after deleting a row
            updateSerialNumbers();
        }

        function updateSerialNumbers() {
            // Loop through each row and update the serial number
            $('#dataTable tbody tr').each(function (index) {
                $(this).find('.serial-number').text(index + 1);
            });

            // Update the rowCount to the current number of rows
            rowCount = $('#dataTable tbody tr').length;
            debugger
            if (rowCount == 0) {
                // Add a new row to the table
                var newRow = '<tr class="text-center">' +
                    '<td colspan="6" class="align-middle">' + 'No matching record found.' + '</td>' +
                    '</tr>';
                $('#dataTable tbody').append(newRow);
            }
        }



        // Add an event listener to the form submit
        $('#meetingMinutesForm').submit(function (event) {

            // Remove is-invalid class from all elements
            $('.is-invalid').removeClass('is-invalid');
            debugger
            // Prevent the default form submission
            event.preventDefault();

            // Get the form data
            var formData = {
                CustomerType: $('input[name="inlineRadioOptions"]:checked').val(),
                CustomerName: $('#customerDropdown option:selected').text(),
                MeetingDate: $('input[name="MeetingDate"]').val(), 
                MeetingPlace: $('input[name="MeetingPlace"]').val(), 
                AttendsClient: $('textarea[name="AttendsClient"]').val(), 
                AttendsHost: $('textarea[name="AttendsHost"]').val(), 
                MeetingAgenda: $('input[name="MeetingAgenda"]').val(), 
                MeetingDiscussion: $('textarea[name="MeetingDiscussion"]').val(), 
                MeetingDecision: $('textarea[name="MeetingDecision"]').val(), 
                MeetingMunitesProducts: getTableRowsData()
            };

            // Send the data to the server
            $.ajax({
                type: 'POST',
                url: saveMeetingMinutesApiEndpoint, 
                contentType: 'application/json',
                data: JSON.stringify(formData),
                success: function (data) {
                    alert(data);
                },
                error: function (error) {
                    console.error(error);
                }
            });
        });

        // Function to get table rows data
        function getTableRowsData() {
            var tableRowsData = [];

            // Iterate through each row in the table
            $('#dataTable tbody tr:not(.no-data)').each(function () {
                var rowData = {
                    ProductService: $(this).find('.product-service').text(),
                    Quantity: $(this).find('.quantity').text(),
                    Unit: $(this).find('.unit').text()
                };

                // Add the row data to the array
                tableRowsData.push(rowData);
            });

            return tableRowsData;
        }

        // Add click event listeners for buttons
        $('#saveButton').click(function () {
            debugger
            if (validateForm()) {
                $('#meetingMinutesForm').submit();
            } else {
                alert('Please fill in all required fields.');
            }
        });

        // Function to validate the form
        function validateForm() {
            var isValid = true;
            debugger
            // Reset previous validation styles
            $('.form-control').removeClass('is-invalid');

            // Validate each required field
            if ($('#customerDropdown').val() === '') {
                $('#customerDropdown').addClass('is-invalid');
                isValid = false;
            }

            if ($('input[name="MeetingAgenda"]').val() === '') {
                $('input[name="MeetingAgenda"]').addClass('is-invalid');
                isValid = false;
            }
            if ($('textarea[name="MeetingDiscussion"]').val() === '') {
                $('textarea[name="MeetingDiscussion"]').addClass('is-invalid');
                isValid = false;
            }
            if ($('textarea[name="MeetingDecision"]').val() === '') {
                $('textarea[name="MeetingDecision"]').addClass('is-invalid');
                isValid = false;
            }
            if ($('input[name="MeetingPlace"]').val() === '') {
                $('input[name="MeetingPlace"]').addClass('is-invalid');
                isValid = false;
            }

            if ($('textarea[name="AttendsClient"]').val() === '') {
                $('textarea[name="AttendsClient"]').addClass('is-invalid');
                isValid = false;
            }

            if ($('textarea[name="AttendsHost"]').val() === '') {
                $('textarea[name="AttendsHost"]').addClass('is-invalid');
                isValid = false;
            }

            // Add additional validation for other fields as needed

            return isValid;
        }

        $('#refreshButton').click(function () {
            // Add refresh logic here if needed
            location.reload();
        });

        // Call the function to fetch product data during the initial load
        fetchProductData();
        fetchCustomerData();
    });
