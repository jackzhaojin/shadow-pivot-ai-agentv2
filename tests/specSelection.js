"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectBestDesignConcept = selectBestDesignConcept;
function selectBestDesignConcept(evaluations) {
    if (evaluations.length === 0)
        return '';
    return evaluations.reduce((best, curr) => curr.score > best.score ? curr : best).concept;
}
