/**
 * Roterer gitt vektor delta antall grader om gitt akse.
 * @param delta
 * @param vector
 * @param axisX
 * @param axisY
 * @param axisZ
 */
export function rotateVector(delta, vector, axisX, axisY, axisZ) {
	var matrix = new Matrix4();
	matrix.setIdentity();
	matrix.rotate(delta, axisX, axisY, axisZ);
	vec3.transformMat4(vector, vector, matrix.elements);
}

/**
 * Fra radianer til grader.
 * @param angle
 * @returns {degree}
 */
export function toDegrees (angle) {
	return angle * (180 / Math.PI);
}

/**
 * Fra grader til radianer.
 * @param angle
 * @returns {radian}
 */
export function toRadians (angle) {
	return angle * (Math.PI / 180);
}

export function getRandomInt (min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Sjekker om value er POT
export function isPowerOfTwo1(value) {
	if (value === 0)
		return false;
	while (value !== 1)
	{
		if (value % 2 !== 0)
			return false;
		value = value/2;
	}
	return true;
}

// Sjekker om value er POT
export function isPowerOfTwo2(value) {
	return (value & (value - 1)) == 0;  //?
}
