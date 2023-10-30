/* eslint-disable no-console */
class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    //1A)Filtering
    const queryObj = { ...this.queryString }; //assigns every field to the query object
    const excludeFields = ["page", "sort", "limit", "field"];
    excludeFields.forEach((el) => delete queryObj[el]); //ignores all the excluded fields
    console.log(this.queryString, queryObj);

    //1B)Advanced filtering for operators
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    console.log(JSON.parse(queryStr));
    console.log(queryObj);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    //2)sorting
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      console.log(sortBy);
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  limitField() {
    //3) Field Limit
    if (this.queryString.field) {
      const field = this.queryString.field.split(",").join(" ");
      this.query = this.query.select(field); //includes the respective field
    } else {
      this.query = this.query.select("-__v"); //excludes the '__v' field
    }
    return this;
  }

  paginate() {
    //4) Pagination
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
