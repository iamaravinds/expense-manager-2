import { ref } from "vue";
import * as csv from "csvtojson";

export function useConvertUtils() {
  const data = ref([]);
  const error = ref(null);

  async function convertCsvToJson(string) {
    return csv()
      .fromString(string)
      .then((result) => (data.value = result));
  }

  async function convertCsvFromFileToJson(file) {
    let reader = new FileReader();
    let content;
    reader.readAsArrayBuffer(file);
    reader.onloadend = (evt) => {
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


  return { convertCsvToJson, convertCsvFromFileToJson, data, error };
}
