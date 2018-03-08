
const taxRate = 0.15
const feeRate = 0.1
const feeMax = 2.00

const getTax = subtotal =>  Math.round(subtotal * taxRate, 2);

const getFee = subtotal => subtotal * feeRate < feeMax ? Math.round(subtotal * feeRate, 2) : feeMax;

const strip$ = string => Number(string.substr(1));
function get$(n) {
  //https://stackoverflow.com/questions/149055/how-can-i-format-numbers-as-dollars-currency-string-in-javascript
  return (
    "$" +
    Number(n)
      .toFixed(2)
      .replace(/./g, function(c, i, a) {
        return i && c !== "." && (a.length - i) % 3 === 0 ? "," + c : c;
      })
  );
}

function deleteList(list) {
  $("#alertModal").modal("show");
  $("#alertModal .delete").click(() => {
    list.remove();
    calculateTotalCost();
    $(".card").each((i, element) => {
      onSave(element.id, true);
    });

    $("#alertModal .delete").off("click");
  });
}

const templates = {
  item: ({ name, cost }) =>
    `
<li class="item list-group-item d-flex justify-content-between align-items-center">
    <span class="name">${name}</span>
    <span class="cost edit">${get$(cost)}</span>
    <button class="btn btn-outline-danger icon remove">
       <i class="material-icons">clear</i>
    </button>
 </li>
`,
  list: (id) => `
<div class="card" id="${id}"><button class="del hide"><i class="material-icons">remove_circle</i></button>
    <div class="card-header justify-content-between">
        <h1 class="person">Person</h1>
        <input class="form-control person hide" type="text" aria-describedby="Name" placeholder="Name" value="" />
        <button class="btn-edit btn btn-outline-info btn-sm" onClick="onEdit('${id}')">Edit</button>
        <button class="btn-save btn btn-outline-success btn-sm hide" onClick="onSave('${id}')">
          Save
        </button>
    </div>
    <ul class="list-group list-group-flush">
        <li class="item list-group-item d-flex justify-content-between align-items-center">
            <span class="name">Item 1</span><span class="cost">$14.55</span>
            <button class="btn btn-outline-danger icon remove hide">
            <i class="material-icons">clear</i>
          </button>
        </li>
        <li class="item list-group-item d-flex justify-content-between align-items-center">
            <span class="name">Item 2</span>
            <span class="cost">$14.50</span>
            <button class="btn btn-outline-danger icon remove hide">
            <i class="material-icons">clear</i>
          </button>
        </li>
        <li class="list-group-item d-flex justify-content-between align-items-center add-item hide">
            <input class="form-control name" type="text" aria-describedby="Name" placeholder="Name" value="" />
            <input class="form-control cost" type="number" aria-describedby="Cost" placeholder="Cost" value="" />
            <button class="btn btn-outline-success icon add">
            <i class="material-icons">add</i>
          </button>
        </li>
    </ul>

    <div class="card-header justify-content-between subtotal-header">Subtotal: <span class="subtotal">$1.30</span></div>
    <div class="card-header justify-content-between tax-header">Tax: <span class="tax">$1.30</span></div>
    <div class="card-header fee-header justify-content-between">Fee: <span class="fee">$0.33</span></div>
    <div class="card-header total-header justify-content-between">Total: <span class="total">$100.00</span></div>
</div>

`
  
}

function calculateTotalCost() {
  let t = 0;
  $(".total").each((index, element) => {
    t += ($(element).data("total"));
  });
  $(".total-cost").text(get$(t));
  
  let t2 = 0;
  $(".total").each((index, element) => {
    t2 += (strip$($(element).text()));
  });
  $(".total-profit").text(get$(t2-t));
  
  
  
}

function saveEditHelper(id) {
  const p = "#" + id + " ";
  $(p + "h1.person").toggleClass("hide");

  $(p + "input.person").toggleClass("hide");

  $(p + ".btn-edit").toggleClass("hide");

  $(p + ".btn-save").toggleClass("hide");

  $(p + ".remove").toggleClass("hide");

  $(p + ".add-item").toggleClass("hide");

  $(p + ".item .cost").toggleClass("edit");

  $(p + ".del").toggleClass("hide");
  return p;
}
function onEdit(id) {
  const p = saveEditHelper(id);
  $(p + "input.person").val($(p + "h1.person").text());
}
function onSave(id, withoutToggle) {
  let p;
  if (!withoutToggle) {
    p = saveEditHelper(id);
  } else {
    p = "#" + id + " ";
  }
  $(p + "h1.person").text($(p + "input.person").val() || "Name");
  let subtotal = 0;
  $(p + ".item .cost").each((index, element) => {
    subtotal += strip$($(element).text());
  });
  let tax = getTax(subtotal);
  let fee = getFee(subtotal);
  let total = subtotal + tax + fee;
  
  $(p + ".subtotal").text(get$(subtotal));
  $(p + ".tax").text(get$(tax));
  $(p + ".fee").text(get$(fee));
  $(p + ".total")
    .data("total", tax + subtotal)
    .text(get$(total))
  calculateTotalCost();
}

function update(){
  calculateTotalCost();
  $(".card").each((i, element) => {
    onSave(element.id, true);
  });
  
  $(".del").off("click", "i")
  $(".icon.remove").off("click", "i")
  $(".icon.add").off("click", "i")
  
  $(".del").on("click", "i", e => {
    deleteList(
      $(e.target)
        .parent()
        .parent()
    );
  });
  $(".icon.remove").on("click", "i", e => {
    // i -> button -> li
    $(e.target)
      .parent()
      .parent()
      .remove();
  });
  $(".icon.add").on("click", "i", e => {
    // i -> button -> li
    const p = $(e.target)
      .parent()
      .parent();
    //get name and cost of new item
    let name = $(p.children(".name")[0]).val();
    let cost = $(p.children(".cost")[0]).val();
    //clear text fields
    $(p.children(".name")[0]).val("");
    $(p.children(".cost")[0]).val("");

    let t = templates.item({ name, cost });
    console.log(t);
    $(t).insertBefore(p);

    $(".icon.remove").on("click", "i", e => {
      // i -> button -> li
      $(e.target)
        .parent()
        .parent()
        .remove();
    });
  });

}

function addNewList(){
  const id = "c" + Math.round(Math.random() * 1e7);
    let t = templates.list(id);
    $(".grid").append(t);
    update();
}



$(() => {
  addNewList()

  $("#alertModal .cancel").click(() => {
    $("#alertModal .cancel").off("click");
    $("#alertModal .delete").off("click");
  });

  $(".add-list").click(e => {
     addNewList()
  });
});
