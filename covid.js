function movingAverage(values, N) {
	let i = 0;
	let sum = 0;
	const means = new Float64Array(values.length).fill(NaN);
	for (let n = Math.min(N - 1, values.length); i < n; ++i) {
		sum += values[i];
	}
	for (let n = values.length; i < n; ++i) {
		sum += values[i];
		means[i] = sum / N;
		sum -= values[i - N + 1];
	}
	return means;
}

const parseDate = d3.timeParse("%Y-%m-%d");

const width = 800;
const height = 250;
const margin = ({ top: 20, right: 30, bottom: 30, left: 12 });

function dailyDeaths(data, container, filter) {

	data = data.filter(filter);

	const averageOfDays = 4;

	const x = d3.scaleTime()
		.domain(d3.extent(data, d => d.x))
		.range([margin.left, width - margin.right]);

	const bins = d3.histogram()
		.value(d => d.x)
		.domain(x.domain())
		.thresholds(x.ticks(d3.timeDay))
		(data);

	const values = movingAverage(bins.map(d => d.length), averageOfDays);

	const y = d3.scaleLinear()
		.domain([0, d3.max(values)]).nice()
		.rangeRound([height - margin.bottom, margin.top]);

	const xAxis = g => g
		.attr("transform", `translate(0,${height - margin.bottom})`)
		.call(d3.axisBottom(x).tickSizeOuter(0));

	const yAxis = g => g
		.attr("transform", `translate(${margin.left},0)`)
		.call(d3.axisLeft(y))
		.call(g => g.select(".domain").remove())
		.call(g => g.selectAll(".tick line").clone()
			.attr("x2", width)
			.attr("stroke-opacity", 0.1));

	const yAxisRight = g => g
		.attr("transform", `translate(${width - margin.right},0)`)
		.call(d3.axisRight(y))
		.call(g => g.select(".domain").remove());

	const area = d3.area()
		.defined(d => !isNaN(d))
		.x((d, i) => x(bins[i].x0))
		.y0(y(0))
		.y1(y);

	const svg = d3.select(container)
		.append("svg")
		.attr("width", "100%")
		.attr("height", height + margin.top + margin.bottom)
		.attr("viewBox", [0, 0, width, height]);

	svg.append("g")
		.call(xAxis);

	svg.append("g")
		.call(yAxis);

	svg.append("g")
		.call(yAxisRight);

	svg.append("path")
		.attr("fill", "steelblue")
		.attr("d", area(values));
}

function dailyDeathsAgeAvg(data) {
	data = d3.rollup(data, v => d3.mean(v, d => d.y), d => d.x);
	data = d3.map(data.entries(), function (d) { return { date: d[0], value: d[1] }; });

	const line = d3.line()
		.defined(d => !isNaN(d.value))
		.x(d => x(d.date))
		.y(d => y(d.value));

	const x = d3.scaleUtc()
		.domain(d3.extent(data, d => d.date))
		.range([margin.left, width - margin.right]);

	const y = d3.scaleLinear()
		.domain([0, d3.max(data, d => d.value)]).nice()
		.range([height - margin.bottom, margin.top]);

	const xAxis = g => g
		.attr("transform", `translate(0,${height - margin.bottom})`)
		.call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));

	const yAxis = g => g
		.attr("transform", `translate(${margin.left},0)`)
		.call(d3.axisLeft(y))
		.call(g => g.select(".domain").remove())
		.call(g => g.select(".tick:last-of-type text").clone()
			.attr("x", 3)
			.attr("text-anchor", "start")
			.attr("font-weight", "bold")
			.text(data.y));

	const yAxisRight = g => g
		.attr("transform", `translate(${width - margin.right},0)`)
		.call(d3.axisRight(y))
		.call(g => g.select(".domain").remove())
		.call(g => g.select(".tick:last-of-type text").clone()
			.attr("x", 3)
			.attr("text-anchor", "start")
			.attr("font-weight", "bold")
			.text(data.y));

	const svg = d3.select("#daily_deaths_age_average")
		.append("svg")
		.attr("width", "100%")
		.attr("height", height + margin.top + margin.bottom)
		.attr("viewBox", [0, 0, width, height]);

	svg.append("g")
		.call(xAxis);

	svg.append("g")
		.call(yAxis);

	svg.append("g")
		.call(yAxisRight);

	svg.append("path")
		.datum(data)
		.attr("fill", "none")
		.attr("stroke", "steelblue")
		.attr("stroke-width", 1.5)
		.attr("stroke-linejoin", "round")
		.attr("stroke-linecap", "round")
		.attr("d", line);
}

function ageTimeHistogram(data) {
	const radius = 1;

	const xAxis = g => g
		.attr("transform", `translate(0,${height - margin.bottom})`)
		.call(d3.axisBottom(x).tickSizeOuter(0));


	const yAxis = g => g
		.attr("transform", `translate(${margin.left},0)`)
		.call(d3.axisLeft(y).ticks(null, ".1s"))
		.call(g => g.select(".domain").remove())
		.call(g => g.append("text")
			.attr("x", 4)
			.attr("y", margin.top)
			.attr("dy", ".71em")
			.attr("fill", "currentColor")
			.attr("font-weight", "bold")
			.attr("text-anchor", "start")
			.text(data.y));

	const yAxisRight = g => g
		.attr("transform", `translate(${width - margin.right},0)`)
		.call(d3.axisRight(y).ticks(null, ".1s"))
		.call(g => g.select(".domain").remove())
		.call(g => g.append("text")
			.attr("x", 4)
			.attr("y", margin.top)
			.attr("dy", ".71em")
			.attr("fill", "currentColor")
			.attr("font-weight", "bold")
			.attr("text-anchor", "start")
			.text(data.y));

	const x = d3.scaleTime()
		.domain(d3.extent(data, d => d.x))
		.rangeRound([margin.left, width - margin.right]);

	const y = d3.scaleLinear()
		.domain(d3.extent(data, d => d.y))
		.rangeRound([height - margin.bottom, margin.top]);

	const hexbin = d3.hexbin()
		.x(d => x(d.x))
		.y(d => y(d.y))
		.radius(radius * width / (height - 1))
		.extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]]);

	const bins = hexbin(data)

	const color = d3.scaleSequential(d3.interpolateBuPu)
		.domain([0, d3.max(bins, d => d.length) / 2]);

	const svg = d3.select("#daily_deaths_age_histogram")
		.append("svg")
		.attr("width", "100%")
		.attr("height", height + margin.top + margin.bottom)
		.attr("viewBox", [0, 0, width, height]);

	svg.append("g")
		.call(xAxis);

	svg.append("g")
		.call(yAxis);

	svg.append("g")
		.call(yAxisRight);

	svg.append("g")
		.attr("stroke", "#000")
		.attr("stroke-opacity", 0.1)
		.selectAll("path")
		.data(bins)
		.join("path")
		.attr("d", hexbin.hexagon())
		.attr("transform", d => `translate(${d.x},${d.y})`)
		.attr("fill", d => color(d.length));
}

d3.csv("https://onemocneni-aktualne.mzcr.cz/api/v2/covid-19/umrti.csv", function (d) {
	return {
		x: parseDate(d.datum),
		y: +d.vek
	}
}).then(function (data) {
	dailyDeaths(data, "#daily_deaths", d => true);
	dailyDeaths(data, "#daily_deaths_85", d => d.y >= 85);
	dailyDeaths(data, "#daily_deaths_75", d => d.y >= 75 && d.y < 85);
	dailyDeaths(data, "#daily_deaths_65", d => d.y >= 65 && d.y < 75);
	dailyDeaths(data, "#daily_deaths_60", d => d.y >= 60 && d.y < 65);
	dailyDeaths(data, "#daily_deaths_55", d => d.y >= 55 && d.y < 60);
	dailyDeaths(data, "#daily_deaths_55_less", d => d.y < 55);
	ageTimeHistogram(data);
	dailyDeathsAgeAvg(data);
});
