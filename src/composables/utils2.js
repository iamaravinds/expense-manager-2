import * as csv from "csvtojson";
import csvFile from "../testdata/my-expenses.csv";
async function convertCsvFromFileToJson(file) {
  let reader = new FileReader();
  let content;
  reader.readAsBinaryString(file);
  reader.onload = (evt) => {
    content = reader.result;
    return csv()
      .fromString(content)
      .then((result) => {
        data.value = result;
        console.log("result", result);
        return result;
      })
      .catch((err) => {
        error.value = err;
        console.log("err", err);
      });
  };
}

convertCsvFromFileToJson(csvFile)
  .then(() => console.log("done"))
  .catch((err) => console.log(err));
