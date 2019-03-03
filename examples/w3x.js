
import War3Map from "../dist/bundle.mjs";

document.querySelector('input').addEventListener('change', (e) => {
  const reader = new FileReader();
  reader.onloadend = (evt) => {
    const reader = new War3Map(evt.target.result);
	console.log(window.map = reader)
  };
  reader.readAsArrayBuffer( e.target.files[0] );
});
