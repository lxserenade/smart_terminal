#jQuery Pagination Plugin

##Basic usage

Basically use [Bootstrap][1] CSS styles and markup. You can also use your own CSS styles.

```html
<link rel="stylesheet" href="bootstrap.min.css">
```

Include jQuery and the plugin on a page.

```html
<script src="jquery.min.js"></script>
<script src="jquery.yzePagination.min.js"></script>
```

The following codes show call the function on `<div>` tag:

```javascript
$(selector).pagination({
  totalPage: 50,
  callback: function(currentPage){
    $('.current-page').text(currentPage)
  }
});
```
###Changelog

v1.3.2

* Use `parseFload($.fn.jquery, 1)` to comfirm jQuery version. For jQuery version lower than 1.7 use `delegate` method and for higher version use `on` method.

###License

Copyright © 2014 Justin Young Licensed under the MIT license.


















[1]: http://getbootstrap.com/