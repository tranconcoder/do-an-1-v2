import { RANGE_1_DISTANCE, RANGE_2_DISTANCE, RANGE_3_DISTANCE, RANGE_4_DISTANCE, RANGE_5_DISTANCE, RANGE_6_DISTANCE } from "@/configs/checkout.config";
import { RANGE_1_FEE_SHIP, RANGE_2_FEE_SHIP, RANGE_3_FEE_SHIP, RANGE_4_FEE_SHIP, RANGE_5_FEE_SHIP, RANGE_6_FEE_SHIP } from "@/configs/checkout.config";

export const getFeeShipByDistance = (distance: number) => {
    const rangeDistances = [RANGE_1_DISTANCE, RANGE_2_DISTANCE, RANGE_3_DISTANCE, RANGE_4_DISTANCE, RANGE_5_DISTANCE, RANGE_6_DISTANCE];
    const rangeFees = [RANGE_1_FEE_SHIP, RANGE_2_FEE_SHIP, RANGE_3_FEE_SHIP, RANGE_4_FEE_SHIP, RANGE_5_FEE_SHIP, RANGE_6_FEE_SHIP];

    let feeShip = 0;

    for (let i = 0; i < rangeDistances.length; i++) {
        if (distance >= rangeDistances[i]) {
            feeShip += rangeDistances[i] * rangeFees[i];
            distance -= rangeDistances[i];
        }

        if (distance == 0) break;
    }

    return feeShip;
};
