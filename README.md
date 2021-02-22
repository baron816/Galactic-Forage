# Galactic Forage

<p align="center">
    <img alt="galaxy" src="https://astronomy.com/-/media/Images/andromeda.jpg?mw=600" />
</p>

Hooks for persistent local state through [localForage](https://github.com/localForage/localForage)

![NPM](https://img.shields.io/npm/l/galactic-forage) ![npm](https://img.shields.io/npm/v/galactic-forage) ![NPM](https://img.shields.io/bundlephobia/minzip/galactic-forage)

## Install

`npm i galactic-forage`

## Usage

### ForageListener

```javascript
import { ForageListener } from 'galactic-forage';

const userStorageListener = new ForageListener('user::12345');

// OR

const userStorageListener = new ForageListener();

...

userStorageListener.init('user::12345');

```

`ForageListener` can recieve the key your values will be stored in the constructor, or the key can be passed later on (say, after the user has been authenticated) using the `init` method.

The key can be whatever you want, it doesn't need to include a user ID, but using a user ID ensures those values can only be accessed by particular users.

### makeCreateForage

```javascript
import { makeCreateForage, ForageListener } from 'galactic-forage';

const listener = new ForageListener('user::12345');

const createForage = makeCreateForage(listener);

export const [useUsername, setUsername, usernameObserver] = createForage('username', '');

export const [useEmail, setEmail, emailObserver] = createForage('email', '');

```

`makeCreateForage` returns another function, which can be used to persist different key-value pairs, and create hooks for use in your components.

In the example above, `createForage` (doesn't need to be named that) is used to create hooks for persisting a user name (`useUsername`) and an email address (`useEmail`). All components using those hooks will correctly update when those values get set, and they will correctly retrieve their values between sessions.

`useEmail` works similarly to `useState`--it returns a tuple of the value itself, and the setter:

```javascript
import { useEmail, useUsername } from 'src/foragesOrWhatever';

function UserInfo() {
  const [username, setUsername] = useUsername();
  const [email, setEmail] = useEmail(); 

  ...
}
```

If you don't need the value and only need to set the value in your component, or you're setting a value from outside of a component (and can't use hooks), use the setter in the second position of the tuple from `createForage` to set values:
```javascript
export const [useEmail, setEmail] = createForage('email', ''); // setEmail can be called from anywhere.
```

`emailObserver` has `subscribe` and `getValue` properties. Pass a function to `subscribe` to listen to updates from anywhere in the app and use `getValue` to grab whatever is the current value of the listener.

```javascript
export const [useEmail, setEmail, emailObserver] = createForage('email', '');

emailObserver.subscribe(email => {
  console.log('email updated:', email);
});
```