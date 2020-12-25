function getSiblings(e) {
  let siblings = [];

  if (!e.parentNode) {
    return siblings;
  }

  let sibling = e.parentNode.firstChild;

  // collecting siblings
  while (sibling) {
    if (sibling.nodeType === 1 && sibling !== e) {
      siblings.push(sibling);
    }
    sibling = sibling.nextSibling;
  }
  return siblings;
}

function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints;
}

if (isTouchDevice()) {
  document.querySelector('html').classList.add('is-touch');
} else {
  document.querySelector('html').classList.add('no-touch');
}

tabbis({
  trigger: 'mouseover',
});

let body = document.querySelector('body'),
  nav = document.querySelector('.nav'),
  navTrigger = document.querySelector('.js-nav-trigger'),
  navClose = document.querySelector('.js-nav-close'),
  navBack = document.querySelector('.js-nav-back'),
  navTitle = document.querySelector('.js-nav-title'),
  navCategory = document.querySelector('.nav-category'),
  navSubCategory = document.querySelector('.nav-subcategory');

function mobileNavClose() {
  let isCategoryShow = navCategory.classList.contains('show');

  if (isCategoryShow) {
    navCategory.classList.remove('show');
    navSubCategory.classList.remove('show');
    navBack.classList.remove('show');
    body.classList.remove('scroll-off');
  }
}

function mobileNavBack() {
  let isSubCategoryShow = navSubCategory.classList.contains('show');
  if (isSubCategoryShow) {
    navSubCategory.classList.remove('show');
    navBack.classList.remove('show');
  }
}

// const nav = document.querySelector('.nav');
document.addEventListener(
  'tabbis',
  (e) => {
    let data = e.detail;
    let siblings = getSiblings(data.tab);
    siblings.forEach(function (item) {
      item.classList.remove('show');
    });
    data.tab.classList.add('show');
    data.pane.parentNode.classList.add('show');
    navBack.classList.add('show');
  },
  false
);

navClose.addEventListener('click', mobileNavClose);
navBack.addEventListener('click', mobileNavBack);

navTrigger.addEventListener('mouseenter', navMouseOver, false);
nav.addEventListener('mouseleave', navMouseOut, false);

// navTrigger.addEventListener('click', function () {
//   if (isTouchDevice()) {
//     body.classList.toggle('scroll-off');
//   }
//   this.classList.toggle('active');
//   navCategory.classList.toggle('show');
// });

function navMouseOver(event) {
  if (isTouchDevice()) {
    body.classList.toggle('scroll-off');
  }
  if (navTrigger.contains(event.target)) {
    navCategory.classList.add('show');
  }
}

function navMouseOut(event) {
  if (!navSubCategory.classList.contains('show')) {
    navCategory.classList.remove('show');
  } else {
    navCategory.classList.remove('show');
    navSubCategory.classList.remove('show');
    navBack.classList.remove('show');
    body.classList.remove('scroll-off');
  }
}

let specBtn = document.querySelectorAll('.js-nav-subcategory');
if (specBtn) {
  specBtn.forEach(function (btn) {
    btn.addEventListener('click', function (event) {
      event.stopPropagation();
      event.target.style.display = 'none';
      let stopItem = btn.parentNode.querySelector('[hidden]');
      stopItem.toggleAttribute('hidden');
      this.classList.toggle('active');
    });
  });
}

function isHidden(el) {
  var style = window.getComputedStyle(el);
  return style.display === 'none';
}

// Promo slider
let promoSlider = new Splide('.promo .splide', {
  perPage: 2,
  perMove: 1,
  pagination: false,
  autoplay: true,
  breakpoints: {
    1024: {
      arrows: false,
    },
    556: {
      perPage: 1,
    },
  },
});
promoSlider.mount();

// Slider banner
let bannerSlider = new Splide('.banner .splide', {
  perPage: 1,
  perMove: 1,
  autoplay: true,
  breakpoints: {
    1024: {
      arrows: false,
    },
  },
});
bannerSlider.mount();

// SLider Last News
let lastNewsSlider = new Splide('.last-news .splide', {
  perPage: 3,
  perMove: 1,
  pagination: false,
  autoplay: true,
  breakpoints: {
    1024: {
      arrows: true,
    },
    767: {
      perPage: 2,
      arrows: false,
    },
    639: {
      perPage: 1,
      arrows: false,
    },
  },
});
lastNewsSlider.mount();

// Gallery
const galleryTabs = document.querySelectorAll('[data-gallery-tabs] button');
const galleryItems = document.querySelectorAll('[data-gallery-item]');

// init first gallery
const productGalleryOptions = {
  perPage: 6,
  perMove: 1,
  pagination: false,
  gap: 30,
  autoplay: true,
  breakpoints: {
    1200: {
      perPage: 5,
    },
    1024: {
      arrows: true,
    },
    992: {
      perPage: 4,
      arrows: false,
    },
    767: {
      perPage: 2,
      arrows: false,
    },
    639: {
      perPage: 1,
      arrows: false,
    },
  },
};
let firstItemGallery = new Splide(
  galleryItems[0].children[0],
  productGalleryOptions
);
galleryTabs[0].classList.add('active');
firstItemGallery.mount();

// init gallery on tab click
galleryTabs.forEach(function (tab, i) {
  tab.addEventListener('click', (e) => {
    e.stopPropagation();
    let target = e.target;

    let galleryWrap = galleryItems[i];
    let gallery = galleryWrap.querySelector('.splide');
    let isActive = gallery.classList.contains('is-active');

    if (isHidden(galleryWrap)) {
      galleryWrap.style.display = 'block';
      target.classList.add('active');

      if (!isActive) {
        let g = new Splide(gallery, productGalleryOptions);
        g.mount();
      }
    }

    // remove
    let siblingsTabs = getSiblings(target);
    siblingsTabs.forEach(function (item) {
      item.classList.remove('active');
    });

    // hidden prev display gallery
    let siblingsPanes = getSiblings(galleryWrap);
    siblingsPanes.forEach(function (item) {
      item.style.display = 'none';
    });
  });
});

// Product quantity
function incrementValue(e) {
  e.preventDefault();
  var fieldName = e.target.dataset.field;
  var parent = e.target.parentNode;

  var currentVal = parseInt(
    parent.querySelector('input[name=' + fieldName + ']').value,
    10
  );

  if (!isNaN(currentVal)) {
    parent.querySelector('input[name=' + fieldName + ']').value =
      currentVal + 1;
  } else {
    parent.querySelector('input[name=' + fieldName + ']').value = 0;
  }
}

function decrementValue(e) {
  e.preventDefault();
  var fieldName = e.target.dataset.field;
  var parent = e.target.parentNode;
  var currentVal = parseInt(
    parent.querySelector('input[name=' + fieldName + ']').value,
    10
  );

  if (!isNaN(currentVal) && currentVal > 0) {
    parent.querySelector('input[name=' + fieldName + ']').value =
      currentVal - 1;
  } else {
    parent.querySelector('input[name=' + fieldName + ']').value = 0;
  }
}

const fieldsQuantitys = document.querySelectorAll('.field-quantity');

for (const field of fieldsQuantitys) {
  field.addEventListener('click', function (event) {
    if (event.target.className === 'field-quantity__plus') {
      incrementValue(event);
    }
    if (event.target.className === 'field-quantity__minus') {
      decrementValue(event);
    }
  });
}

document.addEventListener('click', function (event) {
  // check click outside menu
  if (isOutsideClick('.nav', event.target)) {
    navCategory.classList.remove('show');
    navSubCategory.classList.remove('show');
    navBack.classList.remove('show');
    body.classList.remove('scroll-off');
  }
});

function isOutsideClick(ignor, target) {
  var ignoreElement = document.querySelector(ignor);
  return !ignoreElement.contains(target);
}
