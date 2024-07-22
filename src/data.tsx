export const API_KEY = 'AIzaSyCtRoyOE64n_aCBrWHDPyxA-l16xFtzr3Q'

export const value_converter = (value: number) => {
    if (value < 1000) {
        return value;
    } else if (value < 1000000) {
        return `${(value / 1000).toFixed(1)}K`;
    } else {
        return `${(value / 1000000).toFixed(1)}M`;
    }
}