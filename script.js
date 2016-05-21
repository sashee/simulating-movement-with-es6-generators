$(() => {
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

	const holes = $("#holes circle").map((idx, h) => {
		return {
			x: $(h).attr("cx"),
			y: $(h).attr("cy")
		}
	}).get()

	const difference = (point1, point2) => {
		return {
			x: point1.x - point2.x,
			y: point1.y - point2.y
		};
	}

	const dist = (point1, point2) => {
		const distVector = difference(point1, point2)
		return Math.sqrt(Math.pow(distVector.x, 2) + Math.pow(distVector.y, 2));
	}

	const gravityFn = (point) => {
		return holes.reduce((memo, hole) => {
			const toHoleVector = difference(hole, point)
			const distance = Math.max(dist(hole, point), 0.0000001);
			return {
				ax: memo.ax + toHoleVector.x / Math.pow(distance, 2),
				ay: memo.ay + toHoleVector.y / Math.pow(distance, 2)
			}
		}, {
			ax: 0,
			ay: 0
		})
	}

	$("#game").mousemove((e) => {
		const parentOffset = $("#game").offset();
		const x = e.pageX - parentOffset.left;
		const y = e.pageY - parentOffset.top;
		const vx = x - 150;
		const vy = y - 150;
		const pathGen = pathGenerator(vx / 50, vy / 50, gravityFn);
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
		const newD = "M150 150 " + [...newPath].map((point) => `L ${point.x} ${point.y}`).join(" ");
		$("path").attr("d", newD)
	})

})
