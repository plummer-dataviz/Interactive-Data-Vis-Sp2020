function avg(arr) {
  return (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2);
}

async function loadTableData() {
  const data = await d3.csv("titanic.csv");
  buildTable(data);
}

function buildTable(data) {
  const table = d3.select("#d3-table");
  const thead = table.append("thead");
  thead
    .append("tr")
    .append("th")
    .attr("colspan", "9")
    .attr("class", "text-center")
    .text("Titanic Roster");

  const columnTitles = thead.append("tr");
  columnTitles.insert("td", ":first-child").text("");

  columnTitles
    .selectAll()
    .data(data.columns)
    .join("td")
    .text(d => d);

  // thead.insert("td", "tr:nth-child(2)");

  const tbody = table.append("tbody");
  const rows = tbody
    .selectAll()
    .data(data)
    .join("tr");

  rows
    .selectAll()
    .data(d => Object.entries(d))
    .join("td")
    .attr("class", d => {
      switch (d[0]) {
        case "Survived":
          if (d[1] === "0") {
            return "TD-dead";
          }
          return "TD-alive";
        case "Sex":
          if (d[1] === "female") {
            return "TD-female";
          }
          return "TD-male";
        default:
          return;
      }
    })
    .text(d => {
      switch (d[0]) {
        case "Survived":
          return "";
        case "Sex":
          if (d[1] === "female") {
            return "💁‍♀️";
          }
          return "🙍‍♂️";
        default:
          return d[1];
      }
    });

  //Add in a row and Mean for Age
  const ageColumn = data.map(d => {
    return parseInt(d["Age"]);
  });
  const fareColumn = data.map(d => {
    return parseFloat(d["Fare"]);
  });
  const kinColumn = data.map(d => {
    return parseInt(d["Parents/Children Aboard"]);
  });
  const siblingColumn = data.map(d => {
    return parseInt(d["Siblings/Spouses Aboard"]);
  });
  console.log(siblingColumn);
  const avgAge = avg(ageColumn);
  const avgFare = avg(fareColumn);
  const avgSibling = avg(siblingColumn);
  const avgKin = avg(kinColumn);
  rows.insert("td", ":first-child");
  const avgRow = tbody.insert("tr", ":first-child");
  avgRow
    .append("td")
    .attr("class", "font-weight-bold")
    .text("Averages");
  avgRow
    .selectAll()
    .data(data.columns)
    .join("td")
    .text(d => {
      if (d === "Age") {
        return avgAge;
      }
      if (d === "Fare") {
        return avgFare;
      }
      if (d === "Siblings/Spouses Aboard") {
        return avgSibling;
      }
      if (d === "Parents/Children Aboard") {
        return avgKin;
      }
      return "";
    });
}

document.addEventListener("DOMContentLoaded", loadTableData);
