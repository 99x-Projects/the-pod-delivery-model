# the-pod-delivery-model

A pod is one human pilot with one or more agents. One hour delivered by that unit is a pod hour.

Instead of man hours, see projects in pod hours for greater efficiency, speed, value and quality.

Discussion paper: [Pricing the pod hour](docs/pricing-the-pod-hour.md).

## Client comparison

A small web app for showing a client the same outcome three ways: classical delivery, humans with AI tools, and the 99x pod. The pricing math lives in `src/model/compare.ts` so later tools can reuse it.

```bash
npm install
npm run dev
```

The published site is [https://99x-projects.github.io/the-pod-delivery-model/](https://99x-projects.github.io/the-pod-delivery-model/). It opens on the pod configurator. The comparison under it prices that setup three ways: people alone, ordinary AI tools, and the configured pods. A push to `main` builds the app and deploys it with GitHub Pages. The production build uses `/the-pod-delivery-model/` as its base path. Local `npm run dev` stays at `/`.

The worked example opens at 1,000 hours and a rate of 100 kroner. People alone are the highest price, 100 000 kr. Ordinary AI tools make the early work look shorter, then the later stages grow and take part of that saving back. The total stays under people alone, about 95 000 kr. The pod shifts the work left, the later stages shrink, and the total is about 86 000 kr. Amounts are in NOK. The figures illustrate the comparison. A quote is separate.

## Three-point estimate

`/configure` sets up the pods. You choose each expert — Architect, Developer, QA, DevOps, Delivery Manager, UI/UX, or Product Manager — and the expert skills that work with them. Experts who share the same work go in a cross-over: the skills are priced once, and each other expert is added at the classic rate for their judgement. Experts on different work stay separate. The math lives in `src/model/configure.ts`.

`/estimate` is the sheet used while estimating. Each piece of work has an optimistic, most likely, and pessimistic figure in man hours and the same three figures in pod hours. Expected hours are (optimistic + 4 × most likely + pessimistic) ÷ 6. The page rolls those lines up, with the spread and an 85% and 95% commitment, and prices them at the man-hour rate and the pod-hour rate you enter. The sheet is kept in the browser. The math lives in `src/model/estimate.ts`.
