export function sortDataBy(array, orderBy, order) {
    const comparator = getComparator(order, orderBy)
    return [...array]
        .map((el, idx) => [el, idx])
        .sort((a, b) => {
        const cmp = comparator(a[0], b[0]);
        if (cmp !== 0) return cmp;
        return a[1] - b[1];
        })
        .map((el) => el[0]);
}

function descendingComparator(a, b, prop) {
    const av = (a?.[prop] ?? "").toString().toLowerCase();
    const bv = (b?.[prop] ?? "").toString().toLowerCase();
    if (bv < av) return -1;
    if (bv > av) return 1;
    return 0;
}

function getComparator(order, prop) {
    return order === "desc"
        ? (a, b) => descendingComparator(a, b, prop)
        : (a, b) => -descendingComparator(a, b, prop);
}