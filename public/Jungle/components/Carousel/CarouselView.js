import MyEventEmitter from "../../../Grenutil/MyEventEmitter/index.js";
import Navigation from "../Navigation/index.js";
import templates from "../../templates.js";

export default class CarouselView extends MyEventEmitter {
  constructor({ carouselElement, options }) {
    super();
    this.carousel = carouselElement;

    this.carouselWidth = options.width;
    this.offset = -this.carouselWidth;
    this.currentItem = 1;
    this.isMoving = false;

    this.defaultOption = {
      duration: 200
    };

    this.options = this.mergeOption(options);
  }

  mergeOption(userOption) {
    return { ...this.defaultOption, ...userOption };
  }

  attachClone() {
    const firstItem = this.items[0];
    const lastItem = this.items[this.items.length - 1];

    const firstItemClone = firstItem.cloneNode(true);
    const lastItemClone = lastItem.cloneNode(true);
    firstItemClone.setAttribute("data-isClone", "true");
    lastItemClone.setAttribute("data-isClone", "true");

    firstItem.insertAdjacentElement("beforebegin", lastItemClone);
    lastItem.insertAdjacentElement("afterend", firstItemClone);

    this.items = this.carousel.querySelectorAll(".item"); //clone 붙여서 갱신
  }

  makeCarouselItemHtml(data) {
    return templates.getCarouselItemTempalte({ data });
  }

  attachEvent() {
    this.prevBtn = this.carousel.querySelector(".prev");
    this.nextBtn = this.carousel.querySelector(".next");

    this.prevBtn.addEventListener("click", _ => {
      if (this.isMoving) return;
      this.emit("prev");
    });
    this.nextBtn.addEventListener("click", _ => {
      if (this.isMoving) return;
      this.emit("next");
    });

    this.itemSlider.addEventListener("transitionend", _ =>
      this.emit("moveend")
    );
  }

  setSliderTransition(on) {
    on
      ? (this.itemSlider.style.transition = `${
          this.options.duration
        }ms transform`)
      : (this.itemSlider.style.transition = `none`);
  }

  setCarouselStyle() {
    this.items = this.carousel.querySelectorAll(".item");
    this.itemSlider = this.carousel.querySelector(".item-slider");

    this.itemSlider.style.transform = `translateX(${this.offset}px)`;
    this.setSliderTransition(true);

    this.carousel.style.width = `${this.carouselWidth}px`;
    this.carousel.style.height = `${this.options.height}px`;

    this.items.forEach(item => (item.style.width = `${this.options.width}px`));
  }

  initRender(data) {
    const carouselItemHtml = this.makeCarouselItemHtml(data);

    const carouselTemplate = templates.getCarouselTemplate({
      carouselItemHtml
    });

    this.carousel.innerHTML = carouselTemplate;

    if (this.options.navigation) this.addNav();

    this.setCarouselStyle();
    this.attachClone();
    this.attachEvent();
  }

  isFirstClone() {
    const lastItemIndex = this.items.length - 1;

    return this.currentItem === lastItemIndex;
  }

  isLastClone() {
    return this.currentItem === 0;
  }

  moveToCorrectPosition() {
    this.setSliderTransition(false);

    if (this.isFirstClone()) {
      this.moveToFirstItem();
    } else if (this.isLastClone()) {
      this.moveToLastItem();
    }
  }

  moveToFirstItem() {
    this.offset = -this.carouselWidth;
    this.itemSlider.style.transform = `translateX(${this.offset}px)`;
    this.currentItem = 1;
  }

  moveToLastItem() {
    const lastItemIndexWithoutClone = this.items.length - 2;

    this.offset = -(this.carouselWidth * lastItemIndexWithoutClone);
    this.itemSlider.style.transform = `translateX(${this.offset}px)`;
    this.currentItem = lastItemIndexWithoutClone;
  }

  setItemSliderOffset(itemnum) {
    const offset = -1 * (itemnum * this.carouselWidth);
    this.currentItem = itemnum;

    this.isMoving = true;
    this.setSliderTransition(true);

    this.itemSlider.style.transform = `translateX(${offset}px)`;
  }

  addNav() {
    const navContainer = document.createElement("div");
    navContainer.classList.add("nav-container");

    this.carousel.insertAdjacentElement("beforebegin", navContainer);

    this.nav = new Navigation({
      navigationElement: navContainer,
      options: {
        width: this.carouselWidth,
        height: 100,
        duration: 200
      },
      carousel: this
    });
  }
}
