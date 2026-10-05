# Domain cutover

Payment Link thank-you URLs already use the apex (done 2026-10-05, before DNS):

```
https://stefanie-schumacher.com/workshops/{series}/{slug}/thank-you?session_id={CHECKOUT_SESSION_ID}
```

Stripe substitutes `{CHECKOUT_SESSION_ID}` literally. Fall slugs have no date
suffix; later-season slugs do.

The Stripe webhook and the Sanity revalidate webhook stay on
`https://stefanie-schumacher-com.vercel.app`. Both work for either public host.

Series-pass link `plink_1U18uLLJfnPqUVhgjfiYgQKH` is inactive. Product
`prod_V1BGfIM8ufDyGG` is archived.

## Switch day

1. **DNS** — point apex + www at this Vercel project (currently still Wix).
2. **Vercel domain status** — `stefanie-schumacher.com` and `www` show Valid.
3. **Smoke-test** — `https://stefanie-schumacher.com/` and
   `https://stefanie-schumacher.com/workshops` are this Next app, not Wix.

Then `NEXT_PUBLIC_SITE_URL=https://stefanie-schumacher.com` on Production so
feeds and OG URLs match the public host.

## Fall 2026 (10)

| # | Payment Link | Buy URL | Redirect path |
|---|---|---|---|
| 01 | `plink_1U18uCLJfnPqUVhg0NLfWBbU` | https://buy.stripe.com/aFadRa3QMgtm9nXgrMdZ601 | `/workshops/fall-2026/im-right-youre-wrong-the-fight-that-never-ends/thank-you` |
| 02 | `plink_1U18uELJfnPqUVhgQjmheO7i` | https://buy.stripe.com/bJe3cwbjeb927fP5N8dZ602 | `/workshops/fall-2026/if-we-cant-control-our-partner-why-do-we-keep-trying/thank-you` |
| 03 | `plink_1U18uELJfnPqUVhgj03Mi33c` | https://buy.stripe.com/dRm8wQ3QMdha9nX1wSdZ603 | `/workshops/fall-2026/why-unleashing-on-your-partner-never-gets-you-heard/thank-you` |
| 04 | `plink_1U18uFLJfnPqUVhgkHYmlgiI` | https://buy.stripe.com/dRm3cwevqfpi1Vvb7sdZ604 | `/workshops/fall-2026/the-destructive-force-of-retaliation/thank-you` |
| 05 | `plink_1U18uGLJfnPqUVhgD2TzDNQt` | https://buy.stripe.com/00w3cw4UQele2Zz2AWdZ605 | `/workshops/fall-2026/the-withdrawal-trap/thank-you` |
| 06 | `plink_1U18uHLJfnPqUVhghCoY27Fc` | https://buy.stripe.com/3cI9AU2MIdhacA9cbwdZ606 | `/workshops/fall-2026/the-art-skill-of-acceptance/thank-you` |
| 07 | `plink_1U18uILJfnPqUVhghly0K0j5` | https://buy.stripe.com/14A00kgDyfpigQp7VgdZ607 | `/workshops/fall-2026/the-discipline-of-listening-to-understand/thank-you` |
| 08 | `plink_1U18uILJfnPqUVhgpewIfgNo` | https://buy.stripe.com/6oU4gAevq6SMeIh8ZkdZ608 | `/workshops/fall-2026/responsible-distance-taking-responsible-feedback/thank-you` |
| 09 | `plink_1U18uJLJfnPqUVhgfrcutKJC` | https://buy.stripe.com/6oUcN63QM0uoeIhgrMdZ609 | `/workshops/fall-2026/the-art-of-generosity-empowering-your-partner/thank-you` |
| 10 | `plink_1U18uKLJfnPqUVhgD0xAUpRV` | https://buy.stripe.com/6oU00k72Y5OIcA90sOdZ60a | `/workshops/fall-2026/the-art-of-the-apology/thank-you` |

## Winter 2027 (10)

| # | Payment Link | Buy URL | Redirect path |
|---|---|---|---|
| 01 | `plink_1UNHc7LJfnPqUVhgxlLhiijM` | https://buy.stripe.com/8x200kbjecd643DcbwdZ60c | `/workshops/winter-2027/im-right-youre-wrong-the-fight-that-never-ends-2027-01-27/thank-you` |
| 02 | `plink_1UNHc9LJfnPqUVhgBnXdO9LL` | https://buy.stripe.com/cNi00k1IEdhadEd3F0dZ60d | `/workshops/winter-2027/if-we-cant-control-our-partner-why-do-we-keep-trying-2027-02-03/thank-you` |
| 03 | `plink_1UNHcBLJfnPqUVhg3H1cmAUY` | https://buy.stripe.com/cNi00k5YU2CwcA9dfAdZ60e | `/workshops/winter-2027/why-unleashing-on-your-partner-never-gets-you-heard-2027-02-10/thank-you` |
| 04 | `plink_1UNHcCLJfnPqUVhgvHWpJOEx` | https://buy.stripe.com/7sYfZi2MIele2ZzfnIdZ60f | `/workshops/winter-2027/the-destructive-force-of-retaliation-2027-02-17/thank-you` |
| 05 | `plink_1UNHcELJfnPqUVhgiBOcJvpV` | https://buy.stripe.com/eVq5kE72Y7WQ0RrgrMdZ60g | `/workshops/winter-2027/the-withdrawal-trap-2027-02-24/thank-you` |
| 06 | `plink_1UNHcGLJfnPqUVhgxIteJZ38` | https://buy.stripe.com/00w4gA2MI5OI9nXejEdZ60h | `/workshops/winter-2027/the-art-skill-of-acceptance-2027-03-03/thank-you` |
| 07 | `plink_1UNHcILJfnPqUVhgknyRYAso` | https://buy.stripe.com/eVqaEYfzua4Y2Zz8ZkdZ60i | `/workshops/winter-2027/the-discipline-of-listening-to-understand-2027-03-10/thank-you` |
| 08 | `plink_1UNHcJLJfnPqUVhg84y9Titt` | https://buy.stripe.com/14AfZi0EA2CwfMlgrMdZ60j | `/workshops/winter-2027/responsible-distance-taking-responsible-feedback-2027-03-17/thank-you` |
| 09 | `plink_1UNHcLLJfnPqUVhgF3TCRpF7` | https://buy.stripe.com/8x2aEY3QM5OIgQp2AWdZ60k | `/workshops/winter-2027/the-art-of-generosity-empowering-your-partner-2027-03-24/thank-you` |
| 10 | `plink_1UNHcNLJfnPqUVhgrpd82jJJ` | https://buy.stripe.com/5kQ00kfzu5OI43DdfAdZ60l | `/workshops/winter-2027/the-art-of-the-apology-2027-03-31/thank-you` |

## Spring 2027 (10)

| # | Payment Link | Buy URL | Redirect path |
|---|---|---|---|
| 01 | `plink_1UNHcPLJfnPqUVhgLbV4vdr9` | https://buy.stripe.com/cNi4gAdrm3GAgQp1wSdZ60m | `/workshops/spring-2027/im-right-youre-wrong-the-fight-that-never-ends-2027-04-07/thank-you` |
| 02 | `plink_1UNHcRLJfnPqUVhgP2N47SE1` | https://buy.stripe.com/fZufZi872cd69nX3F0dZ60n | `/workshops/spring-2027/if-we-cant-control-our-partner-why-do-we-keep-trying-2027-04-14/thank-you` |
| 03 | `plink_1UNHcSLJfnPqUVhg3GLJbPjd` | https://buy.stripe.com/9B6aEY0EA6SMdEda3odZ60o | `/workshops/spring-2027/why-unleashing-on-your-partner-never-gets-you-heard-2027-04-21/thank-you` |
| 04 | `plink_1UNHcULJfnPqUVhgENRQogf1` | https://buy.stripe.com/14A7sM9b67WQbw5ejEdZ60p | `/workshops/spring-2027/the-destructive-force-of-retaliation-2027-04-28/thank-you` |
| 05 | `plink_1UNHcWLJfnPqUVhguCa7Qgmx` | https://buy.stripe.com/00wcN6afagtmgQpb7sdZ60q | `/workshops/spring-2027/the-withdrawal-trap-2027-05-05/thank-you` |
| 06 | `plink_1UNHcYLJfnPqUVhgq7D0nHmA` | https://buy.stripe.com/9B65kEfzua4YfMlfnIdZ60r | `/workshops/spring-2027/the-art-skill-of-acceptance-2027-05-12/thank-you` |
| 07 | `plink_1UNHcZLJfnPqUVhgXJwKgwrN` | https://buy.stripe.com/fZu3cwgDy5OIbw52AWdZ60s | `/workshops/spring-2027/the-discipline-of-listening-to-understand-2027-05-19/thank-you` |
| 08 | `plink_1UNHcbLJfnPqUVhgYR1yvLtM` | https://buy.stripe.com/8x2cN63QM1yscA97VgdZ60t | `/workshops/spring-2027/responsible-distance-taking-responsible-feedback-2027-05-26/thank-you` |
| 09 | `plink_1UNHcdLJfnPqUVhgKPN33eJs` | https://buy.stripe.com/dRmdRa2MI7WQgQpa3odZ60u | `/workshops/spring-2027/the-art-of-generosity-empowering-your-partner-2027-06-02/thank-you` |
| 10 | `plink_1UNHcfLJfnPqUVhglT6ngd2G` | https://buy.stripe.com/cNiaEY2MIa4YfMldfAdZ60v | `/workshops/spring-2027/the-art-of-the-apology-2027-06-09/thank-you` |

## Summer 2027 (10)

| # | Payment Link | Buy URL | Redirect path |
|---|---|---|---|
| 01 | `plink_1UNHcgLJfnPqUVhg8pU5mbyL` | https://buy.stripe.com/28E6oIbjecd6fMl0sOdZ60w | `/workshops/summer-2027/im-right-youre-wrong-the-fight-that-never-ends-2027-06-16/thank-you` |
| 02 | `plink_1UNHciLJfnPqUVhgHPMgpXm3` | https://buy.stripe.com/8x28wQdrm5OI1VvcbwdZ60x | `/workshops/summer-2027/if-we-cant-control-our-partner-why-do-we-keep-trying-2027-06-23/thank-you` |
| 03 | `plink_1UNHckLJfnPqUVhgysqsDbts` | https://buy.stripe.com/aFa3cw9b63GAcA9ejEdZ60y | `/workshops/summer-2027/why-unleashing-on-your-partner-never-gets-you-heard-2027-06-30/thank-you` |
| 04 | `plink_1UNHcmLJfnPqUVhgXZOE7ZLi` | https://buy.stripe.com/4gM3cw1IEcd643D3F0dZ60z | `/workshops/summer-2027/the-destructive-force-of-retaliation-2027-07-07/thank-you` |
| 05 | `plink_1UNHcnLJfnPqUVhgZFIZuCqr` | https://buy.stripe.com/4gMfZi872b92as12AWdZ60A | `/workshops/summer-2027/the-withdrawal-trap-2027-07-14/thank-you` |
| 06 | `plink_1UNHcpLJfnPqUVhgM2Ul4Znv` | https://buy.stripe.com/3cI9AUdrm1ys43DcbwdZ60B | `/workshops/summer-2027/the-art-skill-of-acceptance-2027-07-21/thank-you` |
| 07 | `plink_1UNHcrLJfnPqUVhgXa7dl2q6` | https://buy.stripe.com/9B64gAfzudha8jTcbwdZ60C | `/workshops/summer-2027/the-discipline-of-listening-to-understand-2027-07-28/thank-you` |
| 08 | `plink_1UNHctLJfnPqUVhgEvQuctuX` | https://buy.stripe.com/eVqdRa4UQa4YfMlcbwdZ60D | `/workshops/summer-2027/responsible-distance-taking-responsible-feedback-2027-08-04/thank-you` |
| 09 | `plink_1UNHcvLJfnPqUVhgnY1JvcW8` | https://buy.stripe.com/00w3cwfzufpifMldfAdZ60E | `/workshops/summer-2027/the-art-of-generosity-empowering-your-partner-2027-08-11/thank-you` |
| 10 | `plink_1UNHcwLJfnPqUVhgvN4X4BFS` | https://buy.stripe.com/8x2bJ20EAdhacA92AWdZ60F | `/workshops/summer-2027/the-art-of-the-apology-2027-08-18/thank-you` |
