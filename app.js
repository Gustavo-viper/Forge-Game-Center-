const menu=document.querySelector(".menu"),nav=document.querySelector("#nav");
if(menu){menu.addEventListener("click",()=>{nav.classList.toggle("open")})}
document.querySelectorAll("#nav a").forEach(a=>a.addEventListener("click",()=>nav.classList.remove("open")));
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener("click",()=>{history.replaceState(null,"",a.getAttribute("href"))}));
