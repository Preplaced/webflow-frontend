const style = document.createElement('style');

style.textContent = `
.select2-container--default .select2-selection--multiple{
   padding:12px 8px !important;
   border: 2px solid #e8e7ee !important;
}
.select2-container .select2-search--inline .select2-search__field{
    height:21px !important;
    margin:0px !important;
}
.select2-container--focus .selection .select2-selection .select2-search{
    position: relative;
    top: -10px;
}
.select2-container--default .select2-selection--multiple .select2-selection__choice{
    margin: 0px 2px 5px 0 !important;
    background-color: transparent !important;
    border: 2px solid #e8e7ee !important;
    padding: 5px !important;
}
.select2-container--default .select2-selection--multiple .select2-selection__choice__remove{
    height:100% !important;
    border-right: 2px solid #e8e7ee !important;
}
.select2-container--default .select2-selection--multiple .select2-selection__choice__display{
    padding-left:22px !important;
}
.select2-container--default.select2-container--open.select2-container--below .select2-selection--single, .select2-container--default.select2-container--open.select2-container--below .select2-selection--multiple{
    border: 2px solid #e8e7ee !important;
}
.select2-search__field::placeholder{
    color: #999 !important;
    font-size: 14px !important;
    font-weight: 400 !important;
    font-family: 'Gilroy' !important;
}
.select2-container--default.select2-container--focus .select2-selection--multiple{
    border: 2px solid #e8e7ee !important;
}

.bubble-button-border{
    border-color: rgb(36, 99, 235) !important;
}
.select2-container--default .select2-selection--multiple .select2-selection__choice__display{
    font-size:1rem !important;
}
.select2-results__option{
    font-size:1rem !important;
    margin:0.5rem 0 !important;
    padding:0 6px !important;
}
`;

document.head.appendChild(style);