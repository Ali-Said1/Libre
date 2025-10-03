 let cards = document.getElementsByClassName("bookCard");


function search(){
    let input = document.getElementById("searchInput").value.toLowerCase();
    for (i = 0; i < cards.length; i++) { 
        if (!cards[i].innerHTML.toLowerCase().includes(input)) {
            cards[i].style.display="none";
        }
        else {
            cards[i].style.display="block";                 
        }}

}


function filterBooks(category) {
    for (i = 0; i < cards.length; i++) { 
        if (category === "all" || cards[i].classList.contains(category)) {
            cards[i].style.display="block";                 
        } else {
            cards[i].style.display="none";
        }}
    }
