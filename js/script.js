(function () {
  var menuToggle = document.querySelector(".menu-toggle");
  var nav = document.querySelector(".nav");
  var navLinks = document.querySelectorAll(".nav a");
  var menuMore = document.querySelector(".menu-more");
  var extraCards = document.querySelectorAll(".menu-card.is-hidden");
  var galleryButtons = document.querySelectorAll(".gallery-item");
  var lightbox = document.querySelector(".js-lightbox");
  var lightboxImage = document.querySelector(".js-lightbox-image");
  var privacyOpen = document.querySelector(".js-privacy-open");
  var privacy = document.querySelector(".js-privacy");
  var overlayCloses = document.querySelectorAll(".js-overlay-close");
  var hoursStatus = document.querySelector(".js-hours-status");
  var bookingForm = document.querySelector(".js-booking-form");
  var formMessage = document.querySelector(".js-form-message");
  var dateInput = document.querySelector("#date");
  var sections = document.querySelectorAll("main section[id]");

  var weekdayHours = {
    open: 8,
    close: 21,
  };
  var weekendHours = {
    open: 9,
    close: 22,
  };

  // ОБРАБОТКА ЗАГРУЗКИ ИЗОБРАЖЕНИЙ
  function handleImageLoad(img) {
    img.classList.remove("is-loading");
    img.classList.add("is-loaded");
  }

  function handleImageError(img) {
    // Определяем тип заглушки по контексту
    var fallback = "img/placeholder-coffee.svg";

    if (img.closest(".gallery-item") || img.closest(".hero-image")) {
      fallback = "img/placeholder-gallery.svg";
    } else if (img.closest(".menu-card")) {
      var alt = (img.alt || "").toLowerCase();
      if (alt.indexOf("круассан") !== -1 || alt.indexOf("брауни") !== -1) {
        fallback = "img/placeholder-bakery.svg";
      }
    }

    img.onerror = null; // защита от бесконечного цикла
    img.src = fallback;
    handleImageLoad(img);
  }

  // Применяем ко всем картинкам на странице
  var allImages = document.querySelectorAll("img");
  for (var i = 0; i < allImages.length; i += 1) {
    var img = allImages[i];
    img.classList.add("is-loading");

    if (img.complete && img.naturalWidth > 0) {
      handleImageLoad(img);
    } else {
      img.addEventListener("load", function () {
        handleImageLoad(this);
      });
      img.addEventListener("error", function () {
        handleImageError(this);
      });
    }
  }

  setTimeout(function () {
    var stillLoading = document.querySelectorAll("img.is-loading");
    for (var j = 0; j < stillLoading.length; j += 1) {
      handleImageError(stillLoading[j]);
    }
  }, 8000);

  function pad(number) {
    var text = String(number);
    if (text.length < 2) {
      return "0" + text;
    }
    return text;
  }

  function todayValue() {
    var now = new Date();
    return (
      now.getFullYear() +
      "-" +
      pad(now.getMonth() + 1) +
      "-" +
      pad(now.getDate())
    );
  }

  function getHoursForDay(day) {
    if (day === 0 || day === 6) {
      return weekendHours;
    }
    return weekdayHours;
  }

  function updateOpenStatus() {
    if (!hoursStatus) {
      return;
    }

    var now = new Date();
    var hours = getHoursForDay(now.getDay());
    var currentHour = now.getHours();
    var isOpen = currentHour >= hours.open && currentHour < hours.close;

    hoursStatus.classList.remove("is-open", "is-closed");

    if (isOpen) {
      hoursStatus.classList.add("is-open");
      hoursStatus.textContent =
        "Сейчас открыто · до " + pad(hours.close) + ":00";
    } else {
      hoursStatus.classList.add("is-closed");
      hoursStatus.textContent =
        "Сейчас закрыто · ждём с " + pad(hours.open) + ":00";
    }
  }

  function closeNav() {
    if (!nav || !menuToggle) {
      return;
    }
    nav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  }

  function Booking(name, phone, guests, date, time) {
    this.name = name;
    this.phone = phone;
    this.guests = guests;
    this.date = date;
    this.time = time;
  }

  Booking.prototype.describe = function () {
    return (
      "Стол на " +
      this.guests +
      " на имя " +
      this.name +
      " · " +
      this.date +
      " в " +
      this.time
    );
  };

  function showMessage(text, isOk) {
    if (!formMessage) {
      return;
    }
    formMessage.textContent = text;
    if (isOk) {
      formMessage.classList.add("is-ok");
    } else {
      formMessage.classList.remove("is-ok");
    }
  }

  function isValidPhone(phone) {
    var digits = "";
    var i;
    for (i = 0; i < phone.length; i += 1) {
      if (phone[i] >= "0" && phone[i] <= "9") {
        digits += phone[i];
      }
    }
    return digits.length >= 7;
  }

  // ПЛАВНОЕ ОТКРЫТИЕ И ЗАКРЫТИЕ OVERLAY
  function openOverlay(overlay) {
    if (!overlay) return;
    overlay.classList.remove("is-closing");
    overlay.classList.add("is-open");
    document.body.classList.add("is-locked");
  }

  function closeOverlays() {
    var overlays = document.querySelectorAll(".overlay.is-open");
    var i;
    for (i = 0; i < overlays.length; i += 1) {
      var overlay = overlays[i];
      overlay.classList.add("is-closing");
      overlay.classList.remove("is-open");
      
      setTimeout(function () {
        overlay.classList.remove("is-closing");

        if (document.querySelectorAll(".overlay.is-open").length === 0) {
          document.body.classList.remove("is-locked");
        }
      }, 300); // 300ms = длительность transition в CSS
    }
  }

  function updateActiveNav() {
    var currentId = "";
    var i;
    var sectionTop;

    for (i = 0; i < sections.length; i += 1) {
      sectionTop = sections[i].getBoundingClientRect().top;
      if (sectionTop <= 120) {
        currentId = sections[i].id;
      }
    }

    for (i = 0; i < navLinks.length; i += 1) {
      navLinks[i].classList.remove("is-active");
      if (currentId && navLinks[i].getAttribute("href") === "#" + currentId) {
        navLinks[i].classList.add("is-active");
      }
    }
  }

  if (dateInput) {
    dateInput.min = todayValue();
    dateInput.value = todayValue();
  }

  updateOpenStatus();
  updateActiveNav();

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  for (var n = 0; n < navLinks.length; n += 1) {
    navLinks[n].addEventListener("click", closeNav);
  }

  // ПЛАВНОЕ ОТКРЫТИЕ/ЗАКРЫТИЕ КАРТОЧЕК МЕНЮ
  if (menuMore && extraCards.length > 0) {
    // Изначально скрытые карточки не отображаются
    menuMore.addEventListener("click", function () {
      var i;
      var opened = extraCards[0].classList.contains("is-hidden");

      for (i = 0; i < extraCards.length; i += 1) {
        if (opened) {
          extraCards[i].classList.remove("is-hidden");
          extraCards[i].classList.add("is-visible");
        } else {
          extraCards[i].classList.add("is-hidden");
          extraCards[i].classList.remove("is-visible");
        }
      }

      menuMore.textContent = opened ? "Свернуть меню ↑" : "Смотреть всё меню →";
    });
  }

  for (var g = 0; g < galleryButtons.length; g += 1) {
    galleryButtons[g].addEventListener("click", function () {
      var image = this.querySelector("img");
      if (!image || !lightbox || !lightboxImage) {
        return;
      }
      lightboxImage.src = image.src;
      lightboxImage.alt = image.alt;
      openOverlay(lightbox);
    });
  }

  if (privacyOpen && privacy) {
    privacyOpen.addEventListener("click", function () {
      openOverlay(privacy);
    });
  }

  for (var c = 0; c < overlayCloses.length; c += 1) {
    overlayCloses[c].addEventListener("click", closeOverlays);
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeOverlays();
      closeNav();
    }
  });

  var overlays = document.querySelectorAll(".overlay");
  for (var o = 0; o < overlays.length; o += 1) {
    overlays[o].addEventListener("click", function (event) {
      if (event.target === this) {
        closeOverlays();
      }
    });
  }

  window.addEventListener("scroll", updateActiveNav);

  if (bookingForm) {
    bookingForm.addEventListener("submit", function (event) {
      event.preventDefault();

      try {
        var name = bookingForm.name.value.trim();
        var phone = bookingForm.phone.value.trim();
        var guests = Number(bookingForm.guests.value);
        var date = bookingForm.date.value;
        var time = bookingForm.time.value;
        var selectedDate;
        var hours;
        var timeParts;
        var hour;

        if (name.length < 2) {
          showMessage(
            "Напишите имя — так бариста поймёт, на кого стол.",
            false,
          );
          return;
        }

        if (!isValidPhone(phone)) {
          showMessage("Проверьте телефон: нужны хотя бы 7 цифр.", false);
          return;
        }

        if (guests < 1 || guests > 8) {
          showMessage(
            "Мы сажаем компании до 8 человек. Для большей — позвоните нам.",
            false,
          );
          return;
        }

        if (!date || !time) {
          showMessage("Выберите дату и время визита.", false);
          return;
        }

        selectedDate = new Date(date + "T" + time);
        if (isNaN(selectedDate.getTime())) {
          throw new Error("Некорректная дата");
        }

        hours = getHoursForDay(selectedDate.getDay());
        timeParts = time.split(":");
        hour = Number(timeParts[0]);

        if (hour < hours.open || hour >= hours.close) {
          showMessage(
            "В этот день мы работаем с " +
              pad(hours.open) +
              ":00 до " +
              pad(hours.close) +
              ":00.",
            false,
          );
          return;
        }

        var request = new Booking(name, phone, guests, date, time);
        showMessage(
          "Готово. " + request.describe() + ". Ждём вас в PAUSE.",
          true,
        );
        bookingForm.reset();
        bookingForm.date.value = todayValue();
      } catch (error) {
        showMessage(
          "Не получилось отправить заявку. Попробуйте ещё раз или позвоните.",
          false,
        );
      }
    });
  }
})();
