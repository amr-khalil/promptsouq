# Getting started

## Installation

### Install using npm

react-i18next can be added to your project using **npm**:

```bash
# npm
$ npm install react-i18next i18next --save
```

In the `/dist` folder you find specific builds for `commonjs`, `es6 modules`,...

{% hint style="info" %}
The module is optimized to load by webpack, rollup, ... The correct entry points are already configured in the package.json. There should be no extra setup needed to get the best build option.
{% endhint %}

### Load from CDN

You can also add a script tag to load react-i18next from one of the CDNs providing it, eg.:

**unpkg.com**

* <https://unpkg.com/react-i18next/react-i18next.js>
* <https://unpkg.com/react-i18next/react-i18next.min.js>

## Translation "how to"

{% hint style="info" %}
You should read the [i18next](https://www.i18next.com) documentation at some point as we do not repeat all the [configuration options](https://www.i18next.com/overview/configuration-options) and translation functionalities like [plurals](https://www.i18next.com/translation-function/plurals), [formatting](https://www.i18next.com/translation-function/formatting), [interpolation](https://www.i18next.com/translation-function/interpolation), ... here.
{% endhint %}

> **Official CLI**
>
> ⭐ [i18next-cli](https://github.com/i18next/i18next-cli)
>
> The official, high-performance, all-in-one command-line tool for i18next. It handles key extraction, code linting, locale syncing, and type generation. It's built with modern technologies for maximum speed and accuracy. This is the recommended tool for all i18next projects.

**You have two options to translate your content:**

### Simple content

Simple content can easily be translated using the provided `t` function.

**Before:**

```jsx
<div>Just simple content</div>
```

**After:**

{% tabs %}
{% tab title="JavaScript" %}

```jsx
<div>{t('simpleContent')}</div>
```

{% endtab %}

{% tab title="TypeScript" %}

```tsx
<div>{t($ => $.simpleContent)}</div>
```

{% endtab %}
{% endtabs %}

{% hint style="info" %}
You will get the t function by using the [useTranslation](https://react.i18next.com/latest/usetranslation-hook) hook or the [withTranslation](https://react.i18next.com/latest/withtranslation-hoc) hoc.
{% endhint %}

### JSX tree

Sometimes you might want to include html formatting or components like links into your translations. (Always try to get the best result for your translators - the final string to translate should be a complete sentence).

**Before:** Your react code would have looked something like:

```jsx
<div>
  Hello <strong title="this is your name">{name}</strong>, you have {count} unread message(s). <Link to="/msgs">Go to messages</Link>.
</div>
```

**After:** With the trans component just change it to:

```jsx
<Trans i18nKey="userMessagesUnread" count={count}>
  Hello <strong title={t('nameTitle')}>{{name}}</strong>, you have {{count}} unread message. <Link to="/msgs">Go to messages</Link>.
</Trans>
```

{% tabs %}
{% tab title="JavaScript" %}

```
<Trans i18nKey="userMessagesUnread" count={count}>
  Hello <strong title={t('nameTitle')}>{{name}}</strong>, you have {{count}} unread message. <Link to="/msgs">Go to messages</Link>.
</Trans>
```

{% endtab %}

{% tab title="TypeScript" %}

```
<Trans i18nKey="userMessagesUnread" count={count}>
  Hello <strong title={t($ => $.nameTitle)}>{{name}}</strong>, you have {{count}} unread message. <Link to="/msgs">Go to messages</Link>.
</Trans>
```

{% endtab %}
{% endtabs %}

{% hint style="info" %}
Learn more about the Trans Component [here](https://react.i18next.com/latest/trans-component)
{% endhint %}

## Basic sample

This basic sample tries to add i18n in a one file sample.

{% tabs %}
{% tab title="JavaScript" %}

```jsx
import React from "react";
import { createRoot } from 'react-dom/client';
import i18n from "i18next";
import { useTranslation, initReactI18next } from "react-i18next";

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    // the translations
    // (tip move them in a JSON file and import them,
    // or even better, manage them via a UI: https://react.i18next.com/guides/multiple-translation-files#manage-your-translations-with-a-management-gui)
    resources: {
      en: {
        translation: {
          "Welcome to React": "Welcome to React and react-i18next"
        }
      }
    },
    lng: "en", // if you're using a language detector, do not define the lng option
    fallbackLng: "en",

    interpolation: {
      escapeValue: false // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    }
  });

function App() {
  const { t } = useTranslation();

  return <h2>{t('Welcome to React')}</h2>;
}

// append app to dom
const root = createRoot(document.getElementById('root'));
root.render(
  <App />
);
```

{% endtab %}

{% tab title="TypeScript" %}

```tsx
import React from "react";
import { createRoot } from 'react-dom/client';
import i18n from "i18next";
import { useTranslation, initReactI18next } from "react-i18next";

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    // the translations
    // (tip move them in a JSON file and import them,
    // or even better, manage them via a UI: https://react.i18next.com/guides/multiple-translation-files#manage-your-translations-with-a-management-gui)
    resources: {
      en: {
        translation: {
          "Welcome to React": "Welcome to React and react-i18next"
        }
      }
    },
    lng: "en", // if you're using a language detector, do not define the lng option
    fallbackLng: "en",

    interpolation: {
      escapeValue: false // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    }
  });

function App() {
  const { t } = useTranslation();

  return <h2>{t($ => $['Welcome to React'])}</h2>;
}

// append app to dom
const root = createRoot(document.getElementById('root'));
root.render(
  <App />
);
```

{% endtab %}
{% endtabs %}

#### RESULT:

![Preview of content](https://4236364459-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F-L9iS6WpW81N7RGRTQ-K%2Fuploads%2Fgit-blob-2339aca23da3ae3e18d4a101235e3b6cce111ad3%2FScreen%20Shot%202018-09-30%20at%2016.58.18.png?alt=media)

{% hint style="info" %}
This sample while very simple does come with some [drawbacks](https://react.i18next.com/guides/the-drawbacks-of-other-i18n-solutions) to getting the full potential from using react-i18next you should read the extended [step by step guide](https://react.i18next.com/latest/using-with-hooks).
{% endhint %}

### Do you like to read a more complete step by step tutorial?

{% hint style="success" %}
[Here](https://locize.com/blog/react-i18next/) you'll find a simple tutorial on how to best use react-i18next.\
Some basics of i18next and some cool possibilities on how to optimize your localization workflow.[\ <img src="https://4236364459-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F-L9iS6WpW81N7RGRTQ-K%2Fuploads%2Fgit-blob-f210314bc6f460e15c18cd3c5c132fff8c2ad2b8%2Ftitle%20width.jpg?alt=media" alt="" data-size="original">](https://locize.com/blog/react-i18next/)
{% endhint %}


# Quick start

## Install needed dependencies

We expect you having an existing react application - if not give [Vite](https://vite.dev/guide/#scaffolding-your-first-vite-project) (`npm create vite@latest`) or similar a try.

Install both react-i18next and i18next packages:

```bash
npm install react-i18next i18next --save
```

Why do you need i18next package? i18next is the core that provides all translation functionality while react-i18next gives some extra power for using with react.

#### Do you directly want to see an example?

Check out this basic [react example](https://github.com/i18next/react-i18next/tree/master/example/react) with a [browser language-detector](https://github.com/i18next/i18next-browser-languageDetector) and a [http backend](https://github.com/i18next/i18next-http-backend) to load translations from.

#### Do you like to read a more complete step by step tutorial?

{% hint style="success" %}
[Here](https://locize.com/blog/react-i18next/) you'll find a simple tutorial on how to best use react-i18next.\
Some basics of i18next and some cool possibilities on how to optimize your localization workflow.[\
![](https://4236364459-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F-L9iS6WpW81N7RGRTQ-K%2Fuploads%2Fgit-blob-f210314bc6f460e15c18cd3c5c132fff8c2ad2b8%2Ftitle%20width.jpg?alt=media)](https://locize.com/blog/react-i18next/)
{% endhint %}

## Configure i18next

Create a new file `i18n.js` beside your `index.js` containing following content:

```javascript
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)
const resources = {
  en: {
    translation: {
      "Welcome to React": "Welcome to React and react-i18next"
    }
  },
  fr: {
    translation: {
      "Welcome to React": "Bienvenue à React et react-i18next"
    }
  }
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: "en", // language to use, more information here: https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
    // you can use the i18n.changeLanguage function to change the language manually: https://www.i18next.com/overview/api#changelanguage
    // if you're using a language detector, do not define the lng option

    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

  export default i18n;
```

{% hint style="info" %}
The file does not need to be named `i18n.js`, it can be any other filename. Just make sure you import it accordingly.
{% endhint %}

The interesting part here is by `i18n.use(initReactI18next)` we pass the i18n instance to react-i18next which will make it available for all the components via the context api.

Then import that in `index.js`:

```javascript
import React, { Component } from "react";
import { createRoot } from 'react-dom/client';
import './i18n';
import App from './App';

// append app to dom
const root = createRoot(document.getElementById('root'));
root.render(
  <App />
);
```

{% tabs %}
{% tab title="JavaScript" %}
{% hint style="info" %}
If you need to access the `t` function or the `i18next` instance from outside of a React component you can simply import your `./i18n.js` and use the exported i18next instance:

<pre><code><strong>import i18next from './i18n'
</strong>
i18next.t('my.key')
</code></pre>

\
Also read about this [here](https://www.locize.com/blog/how-to-use-i18next-t-outside-react-components) and [here](https://github.com/i18next/react-i18next/issues/1236#issuecomment-762039023).
{% endhint %}
{% endtab %}

{% tab title="TypeScript" %}
{% hint style="info" %}
If you need to access the `t` function or the `i18next` instance from outside of a React component you can simply import your `./i18n.js` and use the exported i18next instance:

<pre><code><strong>import i18next from './i18n'
</strong>
i18next.t($ => $.my.key)
</code></pre>

\
Also read about this [here](https://www.locize.com/blog/how-to-use-i18next-t-outside-react-components) and [here](https://github.com/i18next/react-i18next/issues/1236#issuecomment-762039023).
{% endhint %}
{% endtab %}
{% endtabs %}

## Translate your content

### Using the hook

Using the hook in functional components is one of the options you have.

The `t` function is the main function in i18next to translate content. Read the [documentation](https://www.i18next.com/translation-function/essentials) for all the options.

{% tabs %}
{% tab title="JavaScript" %}

```jsx
import React from 'react';

// the hook
import { useTranslation } from 'react-i18next';

function MyComponent () {
  const { t, i18n } = useTranslation();
  return <h1>{t('Welcome to React')}</h1>
}
```

{% endtab %}

{% tab title="TypeScript" %}

```tsx
import React from 'react';

// the hook
import { useTranslation } from 'react-i18next';

function MyComponent () {
  const { t, i18n } = useTranslation();
  return <h1>{t($ => $['Welcome to React'])}</h1>
}
```

{% endtab %}
{% endtabs %}

Learn more about the hook [useTranslation](https://react.i18next.com/latest/usetranslation-hook).

### Using the HOC

Using higher order components is one of the most used method to extend existing components by passing additional props to them.

The `t` function is the main function in i18next to translate content. Read the [documentation](https://www.i18next.com/translation-function/essentials) for all the options.

{% tabs %}
{% tab title="JavaScript" %}

```jsx
import React from 'react';

// the hoc
import { withTranslation } from 'react-i18next';

function MyComponent ({ t }) {
  return <h1>{t('Welcome to React')}</h1>
}

export default withTranslation()(MyComponent);
```

{% endtab %}

{% tab title="TypeScript" %}

```tsx
import React from 'react';

// the hoc
import { withTranslation } from 'react-i18next';

function MyComponent ({ t }) {
  return <h1>{t($ => $['Welcome to React'])}</h1>
}

export default withTranslation()(MyComponent);
```

{% endtab %}
{% endtabs %}

Learn more about the higher order component [withTranslation](https://react.i18next.com/latest/withtranslation-hoc).

### Using the render prop

The render prop enables you to use the `t` function inside your component.

{% tabs %}
{% tab title="JavaScript" %}

```jsx
import React from 'react';

// the render prop
import { Translation } from 'react-i18next';

export default function MyComponent () {
  return (
    <Translation>
      {
        t => <h1>{t('Welcome to React')}</h1>
      }
    </Translation>
  )
}
```

{% endtab %}

{% tab title="TypeScript" %}

```tsx
import React from 'react';

// the render prop
import { Translation } from 'react-i18next';

export default function MyComponent () {
  return (
    <Translation>
      {
        t => <h1>{t($ => $['Welcome to React'])}</h1>
      }
    </Translation>
  )
}
```

{% endtab %}
{% endtabs %}

Learn more about the render prop [Translation](https://react.i18next.com/latest/translation-render-prop).

### Using the Trans component

The Trans component is the best way to translate a JSX tree in one translation. This enables you to eg. easily translate text containing a link component or formatting like `<strong>`.

```jsx
import React from 'react';
import { Trans } from 'react-i18next';

export default function MyComponent () {
  return <Trans><H1>Welcome to React</H1></Trans>
}

// the translation in this case should be
"<0>Welcome to React</0>": "<0>Welcome to React and react-i18next</0>"
```

Don't worry if you do not yet understand how the Trans component works in detail. Learn more about it [here](https://react.i18next.com/latest/trans-component).

## Next steps

Depending on your learning style, you can now read the more in-depth [step by step](https://react.i18next.com/latest/using-with-hooks) guide and learn how to load translations using xhr or how to change the language.

Prefer having code to checkout? Directly dive into our examples:

* [Example react](https://github.com/i18next/react-i18next/tree/master/example/react)

> **Would you like to visually check the progress state of your translations?**
>
> *Try* [*translation-check*](https://github.com/locize/translation-check)*, it shows an overview of your translations in a nice UI. Check which keys are not yet translated.*\
> [![](https://4236364459-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-L9iS6WpW81N7RGRTQ-K%2F-McU0OVWmskDXbjzjn-O%2F-McU11WehFkeBR6Vvagy%2Fpreview.jpg?alt=media\&token=ee6dbf07-a733-4499-b562-36592c601d56)](https://github.com/locize/translation-check)