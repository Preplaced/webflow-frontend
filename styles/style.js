const style = document.createElement('style');

style.textContent = `
.select2-container--default .select2-selection--multiple{
   padding:12px 8px;
   border: 2px solid #e8e7ee;
}
.select2-container .select2-search--inline .select2-search__field{
    height:21px !important;
    margin:0px !important;
}
.select2-container--default .select2-selection--multiple .select2-selection__choice{
    margin: 0px 2px 5px 0;
    background-color: transparent;
    border: 2px solid #e8e7ee;
    padding: 5px;
}
.select2-container--default .select2-selection--multiple .select2-selection__choice__remove{
    height:100%;
    border-right: 2px solid #e8e7ee;
}
.select2-container--default .select2-selection--multiple .select2-selection__choice__display{
    padding-left:22px;
}
.select2-container--default.select2-container--open.select2-container--below .select2-selection--single, .select2-container--default.select2-container--open.select2-container--below .select2-selection--multiple{
    border: 2px solid #e8e7ee;
}
.select2-search__field::placeholder{
    color: #999;
    font-size: 14px;
    font-weight: 400;
    font-family: 'Gilroy';
}
.select2-container--default.select2-container--focus .select2-selection--multiple{
    border: 2px solid #e8e7ee !important;
}

.bubble-button-border{
    border-color: rgb(36, 99, 235) !important;
}
`;

document.head.appendChild(style);