export function onScroll(event) {
  if (typeof window === "undefined") {
    return;
  }

  const sections = document.querySelectorAll(".ud-menu-scroll");
  const scrollPos =
    window.pageYOffset ||
    document.documentElement.scrollTop ||
    document.body.scrollTop;

  for (let i = 0; i < sections.length; i++) {
    const currLink = sections[i];
    const val = currLink.getAttribute("href");
    const anchor = val && val.substring(1);
    const refElement = anchor && document.querySelector(`${anchor}`);
    const scrollTopMinus = scrollPos + 73;
    if (
      refElement &&
      refElement.offsetTop <= scrollTopMinus &&
      refElement.offsetTop + refElement.offsetHeight > scrollTopMinus
    ) {
      document
        .querySelector(".ud-menu-scroll.active")
        ?.classList.remove("text-primary");
      currLink.classList.add("text-primary");
    } else {
      currLink.classList.remove("text-primary");
    }
  }
}
