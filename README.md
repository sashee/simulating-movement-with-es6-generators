# Simulating movement with ES6 generators

This is a more complex example on ES6 generators. Simulating movement is inherently an open-ended calculation, which is
usually done with a terminating while loop. With generators, the actual path calculation and the limits are separated
making the code easier to understand and more reusable. It's also useful when the calculations needs to be more precise
than the display.

This example is using the [Gentoo](https://github.com/sashee/gentoo) library.

## The path calculation

The path calculation is a simple generator that keeps track of the current position and velocity and invokes a function
that calculates the acceleration. It generates an infinite stream of points.

```
	const pathGenerator = function*(vx, vy, gravityFn) {
		const vc = 0.1;
		let position = {
			x: 150,
			y: 150
		}

		let velocity = {
			x: vx,
			y: vy
		}

		while (true) {
			const {
				ax,
				ay
			} = gravityFn(position);
			velocity = {
				x: velocity.x + ax,
				y: velocity.y + ay
			}

			position = {
				x: position.x + velocity.x * vc,
				y: position.y + velocity.y * vc
			}

			yield position;
		}
	}
```

## Displaying the path

The display is simply limiting the output to an arbitrary large number (to prevent infinite loops, like when the ball
reaches a stable orbit around the planets), takes until the ball crashes into one of the planets, then drops the points
which are not needed for displaying the path.

```
	const newPath = gentoo.chain(pathGen)
		.limit(3000)
		.takeWhile((point) => {
			return holes.every((hole) => {
				return dist(hole, point) >= 3.5;
			})
		})
		.filter((() => {
			let lastPoint = undefined;
			return (point) => {
				const result = !lastPoint || dist(lastPoint, point) >= 1;
				if (result) {
					lastPoint = point;
				}
				return result;
			}
		})())
		.value()
```
