 let x = document.getElementsByClassName("bookCard");


function search(){
    let input = document.getElementById("searchInput").value.toLowerCase();
    for (i = 0; i < x.length; i++) { 
        if (!x[i].innerHTML.toLowerCase().includes(input)) {
            x[i].style.display="none";
        }
        else {
            x[i].style.display="block";                 
        }}

}


function filterBooks(category) {
    for (i = 0; i < x.length; i++) { 
        if (category === "all" || x[i].classList.contains(category)) {
            x[i].style.display="block";                 
        } else {
            x[i].style.display="none";
        }}
    }
    