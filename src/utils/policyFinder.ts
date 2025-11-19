export const policyFind = () => {
  const foundPolicy = Array.from(document.querySelectorAll("a")).find((a) =>
    a.textContent?.toLowerCase().includes("privacy policy"),
  );

  let result = {
    found: false,
    url: "",
    text: "",
  };

  if (foundPolicy instanceof HTMLAnchorElement) {
    console.log("Found Policy Link successfully:", foundPolicy.href);
    result.found = true;
    result.url = foundPolicy.href;
    result.text = foundPolicy.textContent;
  } else {
    console.log("cant find");
  }
  return result;
};
