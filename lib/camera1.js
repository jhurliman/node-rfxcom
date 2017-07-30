/**
 * Created by max on 11/07/2017.
 */
const defines = require('./defines'),
    index = require('./index'),
    Transmitter = require('./transmitter'),
    RfxCom = require('./rfxcom');

/*
 * This is a class for controlling security cameras
 */
class Camera1 extends Transmitter {
    constructor(rfxcom, subtype, options) {
        super(rfxcom, subtype, options);
        this.packetType = "camera1";
    };

/*
 * Extracts the device houseCode.
 *
 */
    _splitDeviceId(deviceId) {
        let houseCode = NaN;
        const parts = Transmitter.splitAtSlashes(deviceId);
        if (parts.length !== 1) {
            throw new Error("Invalid deviceId format");
        }
        houseCode = parts[0].toUpperCase().charCodeAt(0);
        if (this.isSubtype('X10_NINJA') && (houseCode < 0x41 || houseCode > 0x50)) {
            throw new Error("Invalid house code '" + parts[0] + "'");
        }
        return {
            houseCode: houseCode
        };
    };

    _sendCommand(deviceId, command, callback) {
        const self = this,
            device = self._splitDeviceId(deviceId),
            seqnbr = self.rfxcom.nextMessageSequenceNumber(),
            buffer = [0x06, defines.CAMERA1, self.subtype, seqnbr, device.houseCode, command, 0];
        self.rfxcom.queueMessage(self, buffer, seqnbr, callback);
        return seqnbr;
    };

    panLeft(deviceId, callback) {
        return this._sendCommand(deviceId, 0x0, callback);
    };

    panRight(deviceId, callback) {
        return this._sendCommand(deviceId, 0x1, callback);
    };

    tiltUp(deviceId, callback) {
        return this._sendCommand(deviceId, 0x2, callback);
    };

    tiltDown(deviceId, callback) {
        return this._sendCommand(deviceId, 0x3, callback);
    };

    goToPosition(deviceId, position, callback) {
        let command = 0;
        if (position === 0) {
            command = 0xc;
        } else if (position >= 1 && position <= 4) {
            command = 0x2 + 2*Math.round(position);
        } else {
            throw new Error("Invalid position: value must be in range 0-4");
        }
        return this._sendCommand(deviceId, command, callback);
    };

    programPosition(deviceId, position, callback) {
        let command = 0;
        if (position === 0) {
            command = 0xd;
        } else if (position >= 1 && position <= 4) {
            command = 0x3 + 2*Math.round(position);
        } else {
            throw new Error("Invalid position: value must be in range 0-4");
        }
        return this._sendCommand(deviceId, command, callback);
    };

    sweep(deviceId, callback) {
        return this._sendCommand(deviceId, 0xe, callback);
    };

    programSweep(deviceId, callback) {
        return this._sendCommand(deviceId, 0xf, callback);
    };

}

module.exports = Camera1;