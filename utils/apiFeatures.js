module.exports = class ApiFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    filter() {
        const queryParams = { ...this.queryStr };
        // Remove these params from the object.
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach((field) => delete queryParams[field]);
        let queryStr = JSON.stringify(queryParams);
        // Replace all occurence of gte, gt... with $gte, $gt...
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

        // If you do not pass any object to find, it will return all the documents in the collection.
        // Build query.
        this.query.find(JSON.parse(queryStr));
        return this;
    }

    sort() {
        if (this.queryStr.sort) {
            const sortParam = this.queryStr.sort.split(',').join(' ');
            this.query.sort(sortParam);
        } else {
            // If there is no sort param in the api, by deafult sort by this field.
            this.query.sort('-createdAt');
        }
        return this;
    }

    // Return only these fields in the response.
    selectFields() {
        if (this.queryStr.fields) {
            const fields = this.queryStr.fields.split(',').join(' ');
            this.query.select(fields);
        } else {
            this.query.select('-__v');
        }
        return this;
    }

    pagination() {
        const page = +this.queryStr.page || 1;
        const limit = +this.queryStr.limit || 100;
        // Skip these many records. If page is 5 and limit is 10, then it is records 41 - 50.
        // So skip 40 records to display 5th page records.
        const skip = (page - 1) * limit;
        this.query.skip(skip).limit(limit);
        return this;
    }
};
