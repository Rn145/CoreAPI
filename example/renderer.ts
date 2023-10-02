
const h1 = document.createElement('h1');
h1.textContent = 'ITs WORK!';

const br = document.createElement('br');

const input = document.createElement('input');
input.setAttribute('type', 'text');

const button = document.createElement('button');
button.textContent = 'set title';
button.onclick = () => {
  const value = input.value;

  //----------------------------------------------------
  const result = CoreAPI.sync.exec('setTitle', value);
  //----------------------------------------------------

  console.log('setTitle', result);
}

document.body.appendChild(h1);
document.body.appendChild(br);
document.body.appendChild(input);
document.body.appendChild(button);

//----------------------------------------------------
CoreAPI.on('timer', (argument) => {
  console.log('timer', argument);
})
//----------------------------------------------------