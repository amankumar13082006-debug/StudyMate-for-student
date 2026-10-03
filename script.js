let tasks=JSON.parse(localStorage.getItem("studymate_tasks"))||[];
let notes=JSON.parse(localStorage.getItem("studymate_notes"))||[];
let studyHours=JSON.parse(localStorage.getItem("studymate_hours"))||[2,3,1,4,2,0,1];

let time=1500;
let timerInterval=null;

const navs=document.querySelectorAll(".nav");

navs.forEach(function(nav){
nav.addEventListener("click",function(e){
e.preventDefault();
showPage(nav.dataset.page);
});
});

function showPage(page){
document.querySelectorAll(".page").forEach(function(p){
p.classList.remove("active-page");
});

document.getElementById(page).classList.add("active-page");

navs.forEach(function(n){
n.classList.remove("active");
if(n.dataset.page===page){
n.classList.add("active");
}
});

let titles={
dashboard:"Dashboard",
tasks:"Task Manager",
timetable:"Weekly Timetable",
pomodoro:"Pomodoro Timer",
notes:"My Notes"
};

document.getElementById("pageTitle").innerText=titles[page];

if(page==="tasks"){
displayTasks();
}

if(page==="notes"){
displayNotes();
}
}

function updateDate(){
let date=new Date();

let options={
weekday:"long",
year:"numeric",
month:"long",
day:"numeric"
};

document.getElementById("dateText").innerText=date.toLocaleDateString("en-IN",options);
}

function openTaskModal(){
document.getElementById("taskModal").style.display="flex";
document.getElementById("taskName").focus();
}

function closeTaskModal(){
document.getElementById("taskModal").style.display="none";
}

function saveTask(){

let name=document.getElementById("taskName").value.trim();
let subject=document.getElementById("taskSubject").value.trim();
let priority=document.getElementById("taskPriority").value;
let date=document.getElementById("taskDate").value;

if(name===""){
alert("Please enter a task name.");
return;
}

let task={
id:Date.now(),
name:name,
subject:subject||"General",
priority:priority,
date:date,
completed:false
};

tasks.push(task);

localStorage.setItem("studymate_tasks",JSON.stringify(tasks));

document.getElementById("taskName").value="";
document.getElementById("taskSubject").value="";
document.getElementById("taskDate").value="";

closeTaskModal();
updateStats();
displayTasks();
}

function displayTasks(){

let list=document.getElementById("taskList");

let search=document.getElementById("searchTask")?.value.toLowerCase()||"";

let filter=document.getElementById("filterTask")?.value||"all";

let priorityFilter=document.getElementById("priorityFilter")?.value||"all";

let filtered=tasks.filter(function(task){

let searchMatch=task.name.toLowerCase().includes(search)||task.subject.toLowerCase().includes(search);

let statusMatch=filter==="all"||(filter==="completed"&&task.completed)||(filter==="pending"&&!task.completed);

let priorityMatch=priorityFilter==="all"||task.priority===priorityFilter;

return searchMatch&&statusMatch&&priorityMatch;
});

list.innerHTML="";

if(filtered.length===0){
list.innerHTML='<div class="card-box"><p>No tasks found.</p></div>';
return;
}

filtered.sort(function(a,b){
return a.completed-b.completed;
});

filtered.forEach(function(task){

let div=document.createElement("div");

div.className="task-item";

if(task.completed){
div.classList.add("completed");
}

let dateText=task.date?"Due: "+formatDate(task.date):"No due date";

div.innerHTML=`
<div>
<div class="task-name">${escapeHTML(task.name)}</div>
<div class="task-info">${escapeHTML(task.subject)} • ${dateText}</div>
<span class="priority ${task.priority.toLowerCase()}">${task.priority}</span>
</div>
<div class="task-actions">
<button class="complete-btn" onclick="completeTask(${task.id})">${task.completed?"Undo":"Complete"}</button>
<button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
</div>
`;

list.appendChild(div);
});
}

function completeTask(id){

let task=tasks.find(function(t){
return t.id===id;
});

if(task){
task.completed=!task.completed;
}

localStorage.setItem("studymate_tasks",JSON.stringify(tasks));

updateStats();
displayTasks();
}

function deleteTask(id){

if(!confirm("Delete this task?")){
return;
}

tasks=tasks.filter(function(task){
return task.id!==id;
});

localStorage.setItem("studymate_tasks",JSON.stringify(tasks));

updateStats();
displayTasks();
}

function updateStats(){

let total=tasks.length;

let completed=tasks.filter(function(task){
return task.completed;
}).length;

let pending=total-completed;

let progress=total===0?0:Math.round((completed/total)*100);

document.getElementById("totalTasks").innerText=total;
document.getElementById("completedTasks").innerText=completed;
document.getElementById("pendingTasks").innerText=pending;
document.getElementById("progressPercent").innerText=progress+"%";
document.getElementById("circlePercent").innerText=progress+"%";
document.getElementById("progressBar").style.width=progress+"%";

let degrees=progress*3.6;

document.querySelector(".progress-circle").style.background=
"conic-gradient(var(--primary) "+degrees+"deg,#e2e8f0 "+degrees+"deg)";

if(progress===0){
document.getElementById("progressMessage").innerText="Start adding tasks!";
}else if(progress<50){
document.getElementById("progressMessage").innerText="Keep going! You can do it.";
}else if(progress<100){
document.getElementById("progressMessage").innerText="Great progress! Almost there.";
}else{
document.getElementById("progressMessage").innerText="🎉 All tasks completed!";
}

displayRecentTasks();
}

function displayRecentTasks(){

let box=document.getElementById("recentTasks");

box.innerHTML="";

let recent=tasks.slice().reverse().slice(0,5);

if(recent.length===0){
box.innerHTML="<p>No tasks yet. Add your first task!</p>";
return;
}

recent.forEach(function(task){

let div=document.createElement("div");

div.className="task-item";

if(task.completed){
div.classList.add("completed");
}

div.innerHTML=`
<div>
<div class="task-name">${escapeHTML(task.name)}</div>
<div class="task-info">${escapeHTML(task.subject)}</div>
</div>
<span class="priority ${task.priority.toLowerCase()}">${task.priority}</span>
`;

box.appendChild(div);
});
}

function formatDate(date){

if(!date){
return "";
}

let d=new Date(date+"T00:00:00");

return d.toLocaleDateString("en-IN",{
day:"numeric",
month:"short",
year:"numeric"
});
}

function escapeHTML(text){

let div=document.createElement("div");

div.textContent=text;

return div.innerHTML;
}

function setTimer(minutes){

clearInterval(timerInterval);
timerInterval=null;

time=minutes*60;

updateTimer();

document.getElementById("studyMode").classList.remove("mode-active");
document.getElementById("breakMode").classList.remove("mode-active");

if(minutes===25){
document.getElementById("studyMode").classList.add("mode-active");
}else{
document.getElementById("breakMode").classList.add("mode-active");
}
}

function updateTimer(){

let minutes=Math.floor(time/60);
let seconds=time%60;

let m=minutes<10?"0"+minutes:minutes;
let s=seconds<10?"0"+seconds:seconds;

document.getElementById("timer").innerText=m+":"+s;

let total=1500;

if(document.getElementById("breakMode").classList.contains("mode-active")){
total=300;
}

let percentage=((total-time)/total)*360;

document.querySelector(".timer-circle").style.background=
"conic-gradient(var(--primary) "+percentage+"deg,#e2e8f0 "+percentage+"deg)";
}

function startTimer(){

if(timerInterval){
return;
}

timerInterval=setInterval(function(){

if(time>0){
time--;
updateTimer();
}else{
clearInterval(timerInterval);
timerInterval=null;
alert("⏰ Time is over! Take a short break.");
}

},1000);
}

function pauseTimer(){

clearInterval(timerInterval);

timerInterval=null;
}

function resetTimer(){

clearInterval(timerInterval);

timerInterval=null;

time=1500;

document.getElementById("studyMode").classList.add("mode-active");
document.getElementById("breakMode").classList.remove("mode-active");

updateTimer();
}

function addNote(){

let title=prompt("Enter note title:");

if(!title||title.trim()===""){
return;
}

let content=prompt("Enter your note:");

if(!content||content.trim()===""){
return;
}

let note={
id:Date.now(),
title:title.trim(),
content:content.trim(),
date:new Date().toLocaleDateString("en-IN")
};

notes.push(note);

localStorage.setItem("studymate_notes",JSON.stringify(notes));

displayNotes();

showPage("notes");
}

function displayNotes(){

let list=document.getElementById("notesList");

list.innerHTML="";

if(notes.length===0){
list.innerHTML='<div class="card-box"><p>No notes yet. Create your first note!</p></div>';
return;
}

notes.slice().reverse().forEach(function(note){

let div=document.createElement("div");

div.className="note";

div.innerHTML=`
<h3>${escapeHTML(note.title)}</h3>
<p>${escapeHTML(note.content)}</p>
<div class="note-footer">
<small>${note.date}</small>
<button onclick="deleteNote(${note.id})">Delete</button>
</div>
`;

list.appendChild(div);
});
}

function deleteNote(id){

if(!confirm("Delete this note?")){
return;
}

notes=notes.filter(function(note){
return note.id!==id;
});

localStorage.setItem("studymate_notes",JSON.stringify(notes));

displayNotes();
}

function displayChart(){

let chart=document.getElementById("studyChart");

chart.innerHTML="";

let days=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

let max=Math.max(...studyHours,1);

studyHours.forEach(function(hours,index){

let column=document.createElement("div");

column.className="chart-column";

let value=document.createElement("span");

value.className="chart-value";

value.innerText=hours+"h";

let bar=document.createElement("div");

bar.className="chart-bar";

bar.style.height=(hours/max*130+5)+"px";

let label=document.createElement("span");

label.className="chart-label";

label.innerText=days[index];

column.appendChild(value);
column.appendChild(bar);
column.appendChild(label);

chart.appendChild(column);
});
}

document.getElementById("themeBtn").addEventListener("click",function(){

document.body.classList.toggle("dark");

if(document.body.classList.contains("dark")){
this.innerText="☀️";
localStorage.setItem("studymate_theme","dark");
}else{
this.innerText="🌙";
localStorage.setItem("studymate_theme","light");
}
});

if(localStorage.getItem("studymate_theme")==="dark"){
document.body.classList.add("dark");
document.getElementById("themeBtn").innerText="☀️";
}

window.addEventListener("click",function(e){

let modal=document.getElementById("taskModal");

if(e.target===modal){
closeTaskModal();
}
});

updateDate();
updateStats();
displayTasks();
displayNotes();
displayChart();
updateTimer();